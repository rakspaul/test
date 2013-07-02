class OrdersController < ApplicationController
  include Authenticator

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
    @order.start_date = params[:order][:start_date]
    @order.end_date = params[:order][:end_date]
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
      .includes(:advertiser)
      .includes(:sales_person)
      .includes(:user)
      .limit(50)
    if search_query.present?
      id = Integer(search_query) rescue 0
      # assume that number above 4 digit is search on 'id' or 'source id'
      if id > 9999
        @orders = @orders.find_by_id_or_source_id(id)
      else
        @orders = @orders.where(
                    "orders.name ilike :q or
                      network_advertisers.name ilike :q", q: "%#{search_query}%")
                    .references(:advertiser)
      end
    else
      @orders = @orders.latest_updated
    end

    respond_with(@orders)
  end
end
