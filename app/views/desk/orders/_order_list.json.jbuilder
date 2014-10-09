json.total_pages  orders.total_pages
json.total_count  orders.total_count
json.marketer_name  current_user.network_user? ? "All Campaigns" :  "#{current_user.agency.name} Campaigns"
json.orders do
  json.array! orders do |order|
    json.partial! 'desk/orders/order.json', order: order
  end
end
