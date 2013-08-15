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
        @io_details = @order.io_detail
        @possible_advertisers = if @io_details.try(:client_advertiser_name).blank?
          []
        else
          Advertiser.collective_company.where(["network_advertisers.name LIKE ?", "#{@io_details.client_advertiser_name}%"]).map(&:name)
        end
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

    #@order.name = params[:name] if params[:name]

    if params[:name] == "start_date"
      @order.start_date = Time.zone.parse(params[:value])
    end

    if params[:name] == "end_date"
      @order.end_date = Time.zone.parse(params[:value])
    end

    @order.network_advertiser_id = params[:advertiser_id].to_i if params[:advertiser_id]
    @order.sales_person_id = params[:sales_person_id].to_i if params[:sales_person_id]

    # Legacy orders might not have user's assigned to it. Therefore assign current user
    # as owner/creator of order
    @order.user = current_user if @order.user.nil?

    @order.save if @order.changed?

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

