json.id                 lineitem.id
json.name               lineitem.name
json.active             lineitem.active
json.start_date         format_date(lineitem.start_date)
json.end_date           format_date(lineitem.end_date)
json.volume             lineitem.volume
json.rate               lineitem.rate
json.value              lineitem.value
json.ad_sizes           lineitem.ad_sizes
json.order_id           lineitem.order.id
json.targeted_zipcodes  lineitem.targeted_zipcodes
json.alt_ad_id          lineitem.alt_ad_id
json.keyvalue_targeting lineitem.keyvalue_targeting
json.type               lineitem.type
json.media_type_id      lineitem.media_type_id
if lineitem.video?
  json.master_ad_size    lineitem.master_ad_size
  json.companion_ad_size lineitem.companion_ad_size
end
