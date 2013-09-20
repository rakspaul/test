json.array! @order.lineitems do |lineitem|
  json.partial! 'lineitem.json.builder', lineitem: lineitem

  json.creatives do
    json.array! lineitem.creatives do |creative|
      json.partial! 'creatives/creative.json.jbuilder', creative: creative
    end
  end

  json.selected_dmas do
    json.array! lineitem.designated_market_areas do |dma|
      json.id dma.code
      json.title dma.name
    end
  end
end
