json.array! @nielsen_campaigns do |campaign|
  json.id campaign.id
  json.name campaign.name
  json.cpp_value campaign.cpp_value
  json.imps_value campaign.imps_value
  json.trp_goal campaign.trp_goal
  json.target_gender campaign.target_gender
  json.age_range age_range(campaign)
  json.source_id campaign.source_id
  json.order_id campaign.order_id
end
