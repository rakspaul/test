json.total_pages  orders.total_pages
json.orders do
  json.array! orders do |order|
    json.id              order.id
    json.name            order.name
    json.status          order.io_detail.try(:state)
    json.start_date      format_date(order.start_date)
    json.end_date        format_date(order.end_date)
    json.kpi_type        order.kpi_type
    json.kpi_value       order.kpi_value
    json.brand_name      order.advertiser.name

    json.lineitems_count order.lineitems.try(:size)
  end
end
