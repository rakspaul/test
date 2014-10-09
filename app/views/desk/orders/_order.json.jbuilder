json.id              order.id
json.name            order.name
json.status          order.io_detail.try(:state)
json.start_date      format_date(order.start_date)
json.end_date        format_date(order.end_date)
json.kpi_type        order.kpi_type
json.kpi_value       order.kpi_value
json.total_impressions order.total_impressions
json.total_media_cost  order.total_media_cost
json.expected_media_cost number_with_precision(order.expected_media_cost_during(params[:filter][:start_date],
                                                                                params[:filter][:end_date]),
                                               :precision => 2)
json.brand_name      order.advertiser.name

json.lineitems_count order.lineitems.try(:size)
