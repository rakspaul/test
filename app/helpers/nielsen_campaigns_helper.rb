module NielsenCampaignsHelper
  def age_range(campaign)
    "#{campaign.start_age}-#{campaign.end_age}"
  end
end
