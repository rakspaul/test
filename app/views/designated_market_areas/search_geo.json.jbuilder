json.array! @geos.shuffle[0..18].sort_by(&:name) do |geo|
  json.id geo.id
  json.name geo.name
  json.type (geo.class.to_s == "DesignatedMarketArea" ? "DMA" : geo.class.to_s)
  if geo.class.to_s == "City"
    json.region_name geo.region_name
    json.country_code geo.country_code
  elsif geo.class.to_s == "State"
    json.country_code geo.country.name
  end
end
