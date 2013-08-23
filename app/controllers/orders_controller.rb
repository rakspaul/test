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
    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = params[:order][:sales_person_id].to_i
    @order.network = current_network
    @order.user = current_user
    @order.save

    respond_with(@order)
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
end

