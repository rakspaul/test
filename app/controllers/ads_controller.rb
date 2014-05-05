class AdsController < ActionController::Base
  include Authenticator

  respond_to :json

  def index
    @ads = Ad.includes(:ad_pricing,
              :media_type,
              :order,
              :zipcodes,
              :designated_market_areas,
              :audience_groups,
              {:creatives => :lineitem_assignment}
            ).where(["order_id = ? AND io_lineitem_id IS NOT NULL", params[:order_id].to_i])
    respond_to do |format|
      format.json
    end
  end

  def ad_types
    @ad_types = Ad.of_network(current_network).select(:ad_type).distinct.where("ads.ad_type IS NOT NULL")
    respond_with(@ad_types)
  end

  def ad_priorities
    @ad_priorities = Ad.of_network(current_network).select(:priority).distinct.where("ads.priority IS NOT NULL")
    respond_with(@ad_priorities)
  end
end
