module OrdersHelper
  ORDER_TABLE_COLUMNS = [
    {column: "", size: 'x-small', dmethod: :delete_checkbox},
    {column: "Status", dmethod: :order_status},
    {column: "AMP Id / DFP Id", sortable: true, sort_column: 'id', size: 'medium', dmethod: :order_id_and_source_id_column},
    {column: "Order Name", sortable: true, sort_column: 'order_name', size: 'order-name', dmethod: :order_name_column},
    {column: "Client", dmethod: :reach_client_name},
    {column: "Advertiser", sortable: true, sort_column: 'advertiser', dmethod: :client_advertiser_name},
    {column: "Abbr", dmethod: :reach_client_abbr},
    {column: "AM", dmethod: :account_manager_column},
    {column: "Trafficker", dmethod: :trafficker_column},
    {column: "Start Date", sortable: true, sort_column: 'start_date', size: 'small', dmethod: :start_date},
    {column: "End Date", sortable: true, sort_column: 'end_date', size: 'small', dmethod: :end_date},
  ]

  AGENCY_ORDER_TABLE_COLUMNS = [
    {column: "Status", dmethod: :order_status},
    {column: "AMP Id / DFP Id", sortable: true, size: 'medium', dmethod: :order_id_and_source_id_column},
    {column: "Order Name", sortable: true, size: 'order-name', dmethod: :order_name_column},
    {column: "Client", dmethod: :reach_client_name},
    {column: "Advertiser", dmethod: :client_advertiser_name},
    {column: "AM", dmethod: :account_manager_column},
    {column: "Start Date", sortable: true, size: 'small', dmethod: :start_date},
    {column: "End Date", sortable: true, size: 'small', dmethod: :end_date},
  ]

  def table_columns
    if current_user.agency_user?
      AGENCY_ORDER_TABLE_COLUMNS
    else
      ORDER_TABLE_COLUMNS
    end
  end

  def sort_icon(col, sort_field, sort_direction)
    content_tag(:div, class: 'pure-u actions-container', id: col[:sort_column]) do
      if sort_field == col[:sort_column]
        if sort_direction == "asc"
          content_tag(:i, '', class: 'icon-sort-by-attributes')
        else
          content_tag(:i, '', class: 'icon-sort-by-attributes-alt')
        end
      else
        content_tag(:i, '', class: 'icon-sort')
      end
    end
  end
end
