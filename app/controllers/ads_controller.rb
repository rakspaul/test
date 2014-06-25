class AdsController < ActionController::Base
  include Authenticator

  respond_to :json

  def index
    # we don't include "io_lineitem_id IS NOT NULL" condition because we need to search ads 
    # for DFP-pulled orders too (which may have nil as lineitem)
    @ads = Ad.includes(:ad_pricing,
              :media_type,
              :order,
              :zipcodes,
              :geo_targets,
              :audience_groups,
              {:creatives => :lineitem_assignment}
            ).where(["order_id = ?", params[:order_id].to_i])
    respond_to do |format|
      format.json
    end
  end

end
