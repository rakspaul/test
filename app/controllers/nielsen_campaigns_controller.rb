class NielsenCampaignsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @nielsen_campaigns = NielsenCampaign.where(order_id: params[:order_id])
  end

  def create
    @order = Order.find(params[:order_id])
    p = params.permit(:name, :cpp_value, :imps_value, :trp_goal, :target_gender)
    @nielsen_campaign = @order.nielsen_campaigns.build(p)
    @nielsen_campaign.start_age, @nielsen_campaign.end_age = params[:age_range].split('-')
    @nielsen_campaign.user = current_user
    @nielsen_campaign.save

    respond_with(@nielsen_campaign)
  end

  def update
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.nielsen_campaigns.find(params[:id])
    p = params.permit(:name, :cpp_value, :imps_value, :trp_goal, :target_gender)
    @nielsen_campaign.start_age, @nielsen_campaign.end_age = params[:age_range].split('-')
    @nielsen_campaign.save

    respond_with(@nielsen_campaign)
  end
end
