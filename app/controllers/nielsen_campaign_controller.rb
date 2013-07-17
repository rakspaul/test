class NielsenCampaignController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.nielsen_campaign.build_association(campaign_params)
    @nielsen_campaign.user = current_user
    @nielsen_campaign.save

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

  private
    def campaign_param
      params.permit(:name, :cost_type, :value, :trp_goal, :target_gender, :age_range, dma_ids:[])
    end
end
