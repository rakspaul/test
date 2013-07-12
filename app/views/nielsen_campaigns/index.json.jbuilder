json.array! @nielsen_campaigns do |campaign|
  json.id campaign.id
  json.name campaign.name
  json.cost_type campaign.cost_type
  json.value campaign.value
  json.trp_goal campaign.trp_goal
  json.target_gender campaign.target_gender
  json.age_range age_range(campaign)
  json.source_id campaign.source_id
  json.order_id campaign.order_id
end
