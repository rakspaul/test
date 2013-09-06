class OrdersController < ApplicationController
  include Authenticator

  before_filter :set_users_and_orders, :only => [:index, :show, :delete]

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  def index
  end

  def show
    respond_to do |format|
      format.html { render :index }
      format.json do
        @order = Order.of_network(current_network)
              .includes(:advertiser).find(params[:id])
      end
    end
  end

  def create  
    reach_client = ReachClient.find_by id: params[:order][:reach_client_id]
    if !reach_client
      render json: {status: 'error', errors: {reach_client: 'should be specified'} }
      return
    end

    begin
      bc = find_or_create_billing_contact(params, reach_client)
    rescue ActiveRecord::RecordInvalid => e
      render json: {status: 'error', errors: {billing_contact: e.message} }
      return
    end

    begin
      mc = find_or_create_media_contact(params, reach_client)
    rescue ActiveRecord::RecordInvalid => e
      render json: {status: 'error', errors: {media_contact: e.message} }
      return
    end

    begin
      sales_person = find_sales_person(params)
    rescue ActiveRecord::RecordInvalid => e
      render json: {status: 'error', errors: {sales_person: e.message} }
      return
    rescue ActiveRecord::RecordNotFound
      render json: {status: 'error', errors: {sales_person: "this sales person was not found, please select another one"} }
      return
    end

    begin
      account_manager = find_account_manager(params)
    rescue ActiveRecord::RecordInvalid => e
      render json: {status: 'error', errors: {account_manager: e.message} }
      return
    rescue ActiveRecord::RecordNotFound
      render json: {status: 'error', errors: {account_manager: "this account manager was not found, please select another one"} }
      return
    end

    # :io_asset_filename
    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = sales_person.id
    @order.network = current_network
    @order.user = current_user

    respond_to do |format|
      Order.transaction do
        if @order.save
          IoDetail.create! sales_person_email: params[:order][:sales_person_email], sales_person_phone: params[:order][:sales_person_phone], account_manager_email: params[:order][:account_contact_email], account_manager_phone: params[:order][:account_manager_phone], client_order_id: params[:order][:client_order_id], client_advertiser_name: params[:order][:client_advertiser_name], media_contact: mc, billing_contact: bc, trafficking_status: "unreviewed", account_manager_status: "unreviewed", overall_status: "saved", sales_person: sales_person, reach_client: reach_client, order_id: @order.id, account_manager: account_manager

          errors = save_lineitems_with_ads(params[:order][:lineitems])

          if errors.blank?
            store_io_asset(params)
            format.json { render json: {status: 'success', order_id: @order.id} }
          else
            format.json { render json: {status: 'error', errors: {lineitems: errors}} }
            raise ActiveRecord::Rollback
          end
        else
          format.json { render json: {status: 'error', errors: @order.errors} }
          raise ActiveRecord::Rollback
        end
      end
    end
  end

  def update
    @order = Order.find(params[:id])
    order_param = params[:order]

    @order.name = params[:order][:name]
    @order.start_date = Time.zone.parse(params[:order][:start_date])
    @order.end_date = Time.zone.parse(params[:order][:end_date])
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = params[:order][:sales_person_id].to_i

    # Legacy orders might not have user's assigned to it. Therefore assign current user
    # as owner/creator of order
    @order.user = current_user if @order.user.nil?

    @order.save

    respond_with(@order)
  end

  def search
    search_query = params[:search]
    @orders = Order.of_network(current_network)
      .includes(:sales_person)
      .includes(:user)
      .limit(50)
    if search_query.present?
      @orders = SearchOrdersQuery.new(@orders).search(search_query)
    else
      @orders = @orders.latest_updated
    end

    respond_with(@orders)
  end

  def delete
    ids = params[:ids].split(",")
    Order.delete_all(:id => ids)
    IoDetail.delete_all(:order_id => ids)

    render json: {status: 'success'}
  end

private

  def set_users_and_orders
    sort_column = params[:sort_column]? params[:sort_column] : "name"
    sort_direction = params[:sort_direction]? params[:sort_direction] : "asc"
    order_status = params[:order_status]? params[:order_status] : ""

    if sort_column == "order_name"
      sort_column = "name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    end

    if sort_column == "id"
      sort_column = "source_id"
      order_by = sort_column + "::integer" + " " + sort_direction
    else
      order_by = sort_column + " " + sort_direction
    end

    order_array = Order.includes(:advertiser).of_network(current_network)
                  .filter_by_status(order_status)
                  .order(order_by)
    @orders = Kaminari.paginate_array(order_array).page(params[:page]).per(50)
    @users = User.of_network(current_network)
  end

  def find_account_manager(params)
    p = params.require(:order).permit(:account_contact_name, :account_contact_phone, :account_contact_email)
    am_name = p[:account_contact_name].split(/\s+/)
    User.find_by!(first_name: am_name.first, last_name: am_name.last, email: p[:account_contact_email])
  end

  def find_sales_person(params)
    sp = params.require(:order).permit(:sales_person_name, :sales_person_phone, :sales_person_email)
    sp_name = sp[:sales_person_name].split(/\s+/)
    User.find_by!(first_name: sp_name.first, last_name: sp_name.last, email: sp[:sales_person_email])
  end

  def find_or_create_media_contact(params, reach_client)
    p = params.require(:order).permit(:media_contact_name, :media_contact_email, :media_contact_phone)
    MediaContact.find_or_create_by!(name: p[:media_contact_name], email: p[:media_contact_email], phone: p[:media_contact_phone], reach_client_id: reach_client.id)
  end

  def find_or_create_billing_contact(params, reach_client)
    p = params.require(:order).permit(:billing_contact_name, :billing_contact_phone, :billing_contact_email)
    BillingContact.find_or_create_by!(name: p[:billing_contact_name], email: p[:billing_contact_email], phone: p[:billing_contact_phone], reach_client_id: reach_client.id)
  end

  def store_io_asset params
    file = File.open(params[:order][:io_file_path])
    writer = ::IOFileWriter.new("file_store/io_imports", file, params[:order][:io_asset_filename], @order)
    writer.write
    file.close
    File.unlink(file.path)
  end

  def save_lineitems_with_ads(params)
    li_errors = {}

    params.each_with_index do |li, i|
      li[:lineitem].delete("targeting") # after targeting will be ready

      lineitem = @order.lineitems.build(li[:lineitem])
      lineitem.user = current_user
      if lineitem.save
        li[:ads].to_a.compact.each_with_index do |ad, j|
          begin
            ad[:ad].delete("targeting")
            ad_object = lineitem.ads.build(ad[:ad])
            ad_object.order_id = @order.id
            ad_object.source_id = @order.source_id
            if !ad_object.save
              li_errors[i] ||= {:ads => {}}
              li_errors[i][:ads][j] = ad_object.errors
            end
          rescue => e
            Rails.logger.warn 'e.message - ' + e.message.inspect
            li_errors[i] ||= {:ads => {}}
            li_errors[i][:ads][j] = e.message.match(/PG::Error:\W+ERROR:(.+):/mi).try(:[], 1)
          end
        end
      else
        Rails.logger.warn 'lineitem.errors - ' + lineitem.errors.inspect
        li_errors[i] ||= {}
        li_errors[i][:lineitems] = lineitem.errors
      end
    end

    li_errors
  end

end
