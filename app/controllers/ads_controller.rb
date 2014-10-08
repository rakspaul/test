class AdsController < ActionController::Base
  include Authenticator

  before_filter :require_order, :only => [:index, :ads]

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
            ).where(["order_id = ?", @order.id])
    respond_to do |format|
      format.json
    end
  end

  def ads
    @ads = Ad.where(["order_id = ?", @order.id])
  end

  private

  def require_order
    @order ||= Order.find_by_id(params[:order_id])
  end
end
