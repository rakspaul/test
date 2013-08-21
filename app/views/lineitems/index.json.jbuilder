json.array! @order.lineitems do |lineitem|
  json.partial! 'lineitem.json.builder', lineitem: lineitem
end
