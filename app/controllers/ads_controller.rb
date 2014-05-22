class AdsController < ActionController::Base
  include Authenticator

  respond_to :json

  def index
    @ads = Ad.includes(:ad_pricing,
              :media_type,
              :order,
              :zipcodes,
              :geo_targets,
              :audience_groups,
              {:creatives => :lineitem_assignment}
            ).where(["order_id = ? AND io_lineitem_id IS NOT NULL", params[:order_id].to_i])
    respond_to do |format|
      format.json
    end
  end

  def ad_types
    @ad_types = Ad.of_network(current_network).select(:ad_type).distinct.where("ads.ad_type IS NOT NULL").order("ad_type ASC")
    respond_with(@ad_types)
  end
end
