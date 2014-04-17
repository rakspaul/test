json.array! @lineitems do |lineitem|
  json.partial! 'lineitem.json.builder', lineitem: lineitem

  json.creatives do
    json.array! lineitem.creatives do |creative|
      json.partial! 'creatives/creative.json.jbuilder', creative: creative
    end
  end

  json.selected_geos do
    json.array! lineitem.designated_market_areas+lineitem.cities+lineitem.states do |geo|
      json.id (geo.respond_to?(:code) ? geo.code : geo.id)
      case geo.class.to_s
      when "DesignatedMarketArea"
        json.title "#{geo.name}"
        json.type "DMA"
      when "State"
        json.title "#{geo.name}/#{geo.country.try(:name)}"
        json.type "State"
      when "City"
        json.title "#{geo.name}/#{geo.region_name}/#{geo.country_code}"
        json.type "City"
      end
    end
  end

  json.selected_key_values do
    json.array! lineitem.audience_groups do |ag| 
      json.id ag.id
      json.title ag.name
      json.key_values ag.key_values
    end
  end

  json.frequency_caps do
    json.array! lineitem.frequency_caps do |fc|
      json.id          fc.id
      json.impressions fc.cap_value
      json.time_value  fc.time_value
      json.time_unit   fc.time_unit
    end
  end
end
