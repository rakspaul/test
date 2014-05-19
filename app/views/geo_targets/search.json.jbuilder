json.array! @geos do |geo|
  json.name geo.name

  if geo.class.to_s == "GeoTarget::City"
    json.id           geo.id
    json.type         "City"
    json.region_name  geo.state.try(:name)
    json.country_code geo.country_code
  elsif geo.class.to_s == "GeoTarget::State"
    json.id           geo.id
    json.type         "State"
    json.country_code geo.country.name
  else
    json.id    geo.id
    json.type "DMA"
  end
end
