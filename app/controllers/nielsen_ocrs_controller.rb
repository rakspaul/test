class NielsenOcrsController < ApplicationController
  include Authenticator

  respond_to :json, only: :search

  before_filter :require_client_type_network

  def index
  end

  def show
    render :index
  end

  def search
    search_query = params[:search]

    @orders = Order.of_network(current_network)
                .includes(:nielsen_campaign)
                .order('orders.name')
                .limit(50)

    if search_query.blank? and params[:ocr] == 'true'
      @orders = LatestUpdatedOcrOrdersQuery.new(@orders.includes(:advertiser)).all
    else
      @orders = @orders.where.not(nielsen_campaigns: {order_id: nil}) if params[:ocr] == 'true'
      @orders = SearchOrdersQuery.new(@orders).search(search_query)
    end

    respond_with(@orders)
  end
end
