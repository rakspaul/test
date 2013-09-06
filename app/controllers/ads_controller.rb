class AdsController < ActionController::Base
  respond_to :json

  def index
    order = Order.find params[:order_id]
    respond_with(order.ads)
  end
end
