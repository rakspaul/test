json.array! @results do |li|
  json.name li[:name]
  json.cpp li[:cpp]
  json.trp li[:trp]

  json.ads li[:ads] do |ad|
    json.id ad.id
    json.name ad.description
    json.order_id ad.order_id
    json.nielsen_campaign_id ad.try(:nielsen_campaign_id)
  end
end
