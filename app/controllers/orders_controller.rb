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

    bc = find_or_create_billing_contact(params, reach_client)
    mc = find_or_create_media_contact(params, reach_client)

    sales_person = find_sales_person(params) 
    account_manager = find_account_manager(params)

    # :io_asset_filename
    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = sales_person.id
    @order.network = current_network
    @order.user = current_user

    respond_to do |format|
      if @order.save
        IoDetail.create! client_advertiser_name: params[:order][:client_advertiser_name], media_contact: mc, billing_contact: bc, trafficking_status: "unreviewed", account_manager_status: "unreviewed", overall_status: "saved", sales_person: sales_person, reach_client: reach_client, order: @order, account_manager: account_manager

        store_io_asset(params)

        format.json { render json: {status: 'success', order_id: @order.id} }
      else
        format.json { render json: {status: 'error', errors: @order.errors} }
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
    ids = params[:ids]
    Order.delete_all("id IN(#{ids})")
    IoDetail.delete_all("order_id IN(#{ids})")

    render :action => :index
  end

private

  def set_users_and_orders
    sort_column = params[:sort_column]? params[:sort_column] : "name"
    sort_direction = params[:sort_direction]? params[:sort_direction] : "asc"

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
                  .joins("INNER JOIN io_details ON (io_details.order_id = orders.id)")
                  .order(order_by)
    @orders = Kaminari.paginate_array(order_array).page(params[:page]).per(50)
    @users = User.of_network(current_network)
  end

  def find_account_manager(params)
    p = params.require(:order).permit(:account_manager_name, 
:account_manager_phone, :account_manager_email)
    am_name = p[:account_manager_name].split(/\s+/)
    User.find_by(first_name: am_name.first, last_name: am_name.last, email: p[:account_manager_email])
  end

  def find_sales_person(params)
    sp = params.require(:order).permit(:sales_person_name, :sales_person_phone, :sales_person_email)
    sp_name = sp[:sales_person_name].split(/\s+/)
    User.sales_people.find_by!(first_name: sp_name.first, last_name: sp_name.last, email: sp[:sales_person_email])
  end

  def find_or_create_media_contact(params, reach_client)
    p = params.require(:order).permit(:media_contact_name, :media_contact_email, :media_contact_phone)
    mc = MediaContact.find_or_create_by!(name: p[:media_contact_name], email: p[:media_contact_email], phone: p[:media_contact_phone])
    mc.reach_clients << reach_client
    mc.save
    mc
  end

  def find_or_create_billing_contact(params, reach_client)
    p = params.require(:order).permit(:billing_contact_name, :billing_contact_phone, :billing_contact_email)
    bc = BillingContact.find_or_create_by!(name: p[:billing_contact_name], email: p[:billing_contact_email], phone: p[:billing_contact_phone])
    bc.reach_clients << reach_client
    bc.save
    bc
  end

  def store_io_asset params
    file = File.open(params[:order][:io_file_path])
    writer = IOFileWriter.new("file_store/io_imports", file, params[:order][:io_asset_filename], @order)
    writer.write
    file.close
  end
end
