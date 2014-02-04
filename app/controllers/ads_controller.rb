class AdsController < ActionController::Base
  respond_to :json

  def index
    @ads = Ad.includes(:ad_pricing,
              :media_type,
              :order,
              :zipcodes,
              :designated_market_areas,
              :audience_groups,
              :creatives
            ).where(["order_id = ? AND io_lineitem_id IS NOT NULL", params[:order_id].to_i])
    respond_to do |format|
      format.json
    end
  end
end
