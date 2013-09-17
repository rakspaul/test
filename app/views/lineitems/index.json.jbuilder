json.array! @order.lineitems do |lineitem|
  json.partial! 'lineitem.json.builder', lineitem: lineitem

  json.creatives do
    json.array! lineitem.creatives do |creative|
      json.partial! 'creatives/creative.json.jbuilder', creative: creative
    end
  end
end
