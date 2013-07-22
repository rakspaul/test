class NielsenCampaignController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.build_nielsen_campaign(campaign_params)
    @nielsen_campaign.user = current_user
    @nielsen_campaign.save

    respond_with(@nielsen_campaign)
  end

  def show
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.nielsen_campaign

    respond_with(@nielsen_campaign)
  end

  def update
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.nielsen_campaign

    if @nielsen_campaign
      p = campaign_params
      p[:dma_ids] ||= []  # remove all assigned dmas if none is included in request

      @nielsen_campaign.update_attributes(p)
    end

    respond_with(@nielsen_campaign)
  end

  def ads
    @ads = Ad.joins(:order).where(:order_id => params[:order_id].to_i).where.not(alt_ad_id: nil)
    lineitems = Lineitem.where(name: @ads.map(&:alt_ad_id).uniq)

    @results = []
    @ads.group_by(&:alt_ad_id).each do |alt_ad_id, ads|
      li = lineitems.select{|l| l.name == alt_ad_id}.first || Lineitem.new

      @results << {
        name: alt_ad_id,
        cpp: li.volume,
        trp: li.rate,
        ads: ads,
      }
    end

    respond_with(@results)
  end

  private
    def campaign_params
      params.permit(:name, :cost_type, :value, :trp_goal, :target_gender, :age_range, dma_ids:[])
    end
end
