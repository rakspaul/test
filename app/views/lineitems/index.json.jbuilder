json.array! @lineitems do |lineitem|
  json.partial! 'lineitem.json.builder', lineitem: lineitem

  json.creatives do
    json.array! lineitem.creatives.order("start_date ASC, size ASC") do |creative|
      json.partial! 'creatives/creative.json.jbuilder', creative: creative
    end
  end

  json.selected_dmas do
    json.array! lineitem.designated_market_areas do |dma|
      json.id dma.code
      json.title dma.name
    end
  end

  json.selected_key_values do
    json.array! lineitem.audience_groups do |ag| 
      json.id ag.id
      json.title ag.name
      json.key_values ag.key_values
    end
  end
end
