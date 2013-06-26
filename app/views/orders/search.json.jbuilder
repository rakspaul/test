json.array! @orders do |order|
  json.partial! 'order', order: order
end
