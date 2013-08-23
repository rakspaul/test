class OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  def index
    sort_column = params[:sort_column]? params[:sort_column] : "name"
    sort_direction = params[:sort_direction]? params[:sort_direction] : "asc"

    if sort_column == "order_name"
      sort_column = "name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    end

    order_array = Order.includes(:advertiser).of_network(current_network)
                  .joins("INNER JOIN io_details ON (io_details.order_id = orders.id)")
                  .order(sort_column + " " + sort_direction)
    @orders = Kaminari.paginate_array(order_array).page(params[:page]).per(50);
    @users = User.of_network(current_network)
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
    am_params = params.require(:order).permit(:account_manager_name, 
:account_manager_phone, :account_manager_email)

    # :io_asset_filename
    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = sales_person.id
    @order.network = current_network
    @order.user = current_user

    respond_to do |format|
      if @order.save
        IoDetail.create! client_advertiser_name: params[:order][:client_advertiser_name], media_contact: mc, billing_contact: bc, trafficking_status: "unreviewed", account_manager_status: "unreviewed", overall_status: "saved", sales_person: sales_person, reach_client: reach_client, order: @order

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

private

  def find_sales_person(params)
    sp_params = params.require(:order).permit(:sales_person_name, 
:sales_person_phone, :sales_person_email)
    sp_name = sp_params[:sales_person_name].split(/\s+/)
    User.sales_people.find_by!(first_name: sp_name.first, last_name: sp_name.last, email: sp_params[:sales_person_email])
  end

  def find_or_create_media_contact(params, reach_client)
    mc_params = params.require(:order).permit(:media_contact_name, :media_contact_email, :media_contact_phone)
    MediaContact.find_or_create_by!(name: mc_params[:media_contact_name], email: mc_params[:media_contact_email], phone: mc_params[:media_contact_phone], reach_client: reach_client)
  end

  def find_or_create_billing_contact(params, reach_client)
    bc_params = params.require(:order).permit(:billing_contact_name, :billing_contact_phone, :billing_contact_email)
    BillingContact.find_or_create_by!(name: bc_params[:billing_contact_name], email: bc_params[:billing_contact_email], phone: bc_params[:billing_contact_phone], reach_client: reach_client)
  end

  def store_io_asset params
    file = File.open(params[:order][:io_file_path])
    writer = IOFileWriter.new("file_store/io_imports", file, params[:order][:io_asset_filename], @order)
    writer.write
    file.close
  end
end
