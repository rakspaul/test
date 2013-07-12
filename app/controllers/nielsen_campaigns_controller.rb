class NielsenCampaignsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @nielsen_campaigns = NielsenCampaign.where(order_id: params[:order_id])
  end

  def create
    @order = Order.find(params[:order_id])
    p = params.permit(:name, :cost_type, :value, :trp_goal, :target_gender)
    @nielsen_campaign = @order.nielsen_campaigns.build(p)
    @nielsen_campaign.start_age, @nielsen_campaign.end_age = params[:age_range].split('-')
    @nielsen_campaign.user = current_user
    @nielsen_campaign.save

    respond_with(@nielsen_campaign)
  end

  def update
    @order = Order.find(params[:order_id])
    @nielsen_campaign = @order.nielsen_campaigns.find(params[:id])
    p = params.permit(:name, :cost_type, :value, :trp_goal, :target_gender)
    @nielsen_campaign.start_age, @nielsen_campaign.end_age = params[:age_range].split('-')
    @nielsen_campaign.name = p[:name]
    @nielsen_campaign.cost_type = p[:cost_type]
    @nielsen_campaign.value = p[:value]
    @nielsen_campaign.trp_goal = p[:trp_goal]
    @nielsen_campaign.target_gender  = p[:target_gender]
    @nielsen_campaign.save

    respond_with(@nielsen_campaign)
  end
end
