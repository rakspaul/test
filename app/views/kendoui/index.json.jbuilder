json.total_count @total_count
json.orders @orders do |order|
  json.id order.id
  json.name order.name
  json.advertiser_name order.advertiser.name
  json.advertiser_id order.advertiser.id
  json.start_date order.start_date
  json.end_date order.end_date
end
