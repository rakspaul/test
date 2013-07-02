json.array! @order.lineitems do |lineitem|
  json.partial! 'lineitem', lineitem: lineitem
end
