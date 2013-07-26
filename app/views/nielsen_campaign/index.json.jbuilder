json.array! @nielsen_campaigns do |campaign|
  json.partial! 'campaign', campaign: campaign
end
