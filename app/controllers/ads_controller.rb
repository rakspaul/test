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
            ).where(["order_id = ?", params[:order_id].to_i]) #AND io_lineitem_id IS NOT NULL
    respond_to do |format|
      format.json
    end
  end

end
