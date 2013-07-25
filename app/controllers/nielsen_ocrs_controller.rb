class NielsenOcrsController < ApplicationController
  include Authenticator

  respond_to :json, only: :search

  def index
  end

  def show
    render :index
  end

  def search
    search_query = params[:search]

    @orders = Order.of_network(current_network)
                .includes(:nielsen_campaign)
                .limit(50)

    if search_query.present?
      @orders = SearchOrdersQuery.new(@orders).search(search_query)
    else
      @orders = LatestUpdatedOcrOrdersQuery.new(@orders.includes(:advertiser)).all
    end

    respond_with(@orders)
  end
end
