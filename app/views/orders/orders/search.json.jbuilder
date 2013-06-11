json.array! @orders do |order|
  json.id order.id
  json.source_id order.source_id
  json.name order.name
  json.active order.active
  json.advertiser_name order.advertiser.name
  json.start_date I18n.localize(order.start_date.in_time_zone("Eastern Time (US & Canada)"), :format => :short)
  json.end_date I18n.localize(order.end_date.in_time_zone("Eastern Time (US & Canada)"), :format => :short)
end
