class AdsController < ActionController::Base
  respond_to :json

  def index
    @ads = Ad.where(["order_id = ? AND io_lineitem_id IS NOT NULL", params[:order_id]])
    respond_to do |format|
      format.json
    end
  end
end
