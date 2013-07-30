json.array! @orders do |order|
  json.id order.id
  json.source_id order.source_id
  json.name order.name
  json.active order.active
  json.advertiser_name order.advertiser.name
  json.advertiser_id order.advertiser.id
  json.start_date format_date order.start_date
  json.end_date format_date order.end_date
  json.ocr_enabled !order.nielsen_campaign.nil?
  json.created_at format_datetime(order.created_at)
  json.updated_at format_datetime(order.updated_at)
end
