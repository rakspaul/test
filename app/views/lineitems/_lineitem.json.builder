json.id                 lineitem.id
json.name               lineitem.name
json.active             lineitem.active
json.start_date         format_date(lineitem.start_date)
json.end_date           format_date(lineitem.end_date)
json.volume             lineitem.volume
json.buffer             lineitem.buffer
json.rate               lineitem.rate
json.value              lineitem.value
json.ad_sizes           lineitem.ad_sizes
json.order_id           lineitem.order.id
json.targeted_zipcodes  lineitem.targeted_zipcodes

json.selected_key_values do
  json.array! lineitem.audience_groups.each do |ag|
    json.id ag.id
    json.title ag.name
    json.key_values ag.key_values
  end
end

json.selected_geos do
  json.array! (lineitem.designated_market_areas+lineitem.cities+lineitem.states).each do |geo|
    json.id (geo.respond_to?(:code) ? geo.code : geo.id)
    case geo.class.to_s
    when /DesignatedMarketArea/
      json.title "#{geo.name}"
      json.type "DMA"
    when /State/
      json.title "#{geo.name}/#{geo.country.try(:name)}"
      json.type "State"
    when /City/
      json.title "#{geo.name}/#{geo.region_name}/#{geo.country_code}"
      json.type "City"
    end
  end
end

json.frequency_caps do
  json.array! lineitem.frequency_caps.each do |fc|
    json.id          fc.id
    json.impressions fc.cap_value
    json.time_value  fc.time_value
    json.time_unit   fc.time_unit
  end
end

json.revised            lineitem.revised
json.alt_ad_id          lineitem.alt_ad_id
json.keyvalue_targeting lineitem.keyvalue_targeting
json.type               lineitem.type
json.media_type_id      lineitem.media_type_id
if lineitem.video?
  json.master_ad_size    lineitem.master_ad_size
  json.companion_ad_size lineitem.companion_ad_size
end
json.notes              lineitem.try(:notes)
json.li_id              lineitem.try(:li_id)
