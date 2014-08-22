module OrdersHelper

  include I18nHelper

  def order_table_columns
    arr = [{column: "", size: 'x-small', dmethod: :delete_checkbox},
      {column: localised(identifier + '.status'), dmethod: :order_status},
      {column: localised(identifier + '.amp_id'), sortable: true, sort_column: 'id', size: 'medium', dmethod: :order_id_and_source_id_column},
      {column: localised(identifier + '.campaign') + ' ' + localised(identifier + '.name'), sortable: true, sort_column: 'order_name', size: 'order-name', dmethod: :order_name_column},
      {column: localised(identifier + '.advertiser'), sortable: true, sort_column: 'advertiser', dmethod: :client_advertiser_name},
      {column: localised(identifier + '.am'), dmethod: :account_manager_column},
      {column: localised(identifier + '.trafficker'), dmethod: :trafficker_column},
      {column: localised(identifier + '.start_date'), sortable: true, sort_column: 'start_date', size: 'small', dmethod: :start_date},
      {column: localised(identifier + '.end_date'), sortable: true, sort_column: 'end_date', size: 'small', dmethod: :end_date},
    ]
    if identifier == CONVENTION_AGENCY
      arr.insert(4,{column: localised(identifier + '.client'), dmethod: :reach_client_name})
      arr.insert(5,{column: localised(identifier + '.abbr'), dmethod: :reach_client_abbr})
    end
    return arr
  end

  def agency_order_table_columns
    [
      {column: localised(identifier + '.status'), dmethod: :order_status},
      {column: localised(identifier + '.amp_id'), sortable: true, size: 'medium', dmethod: :order_id_and_source_id_column},
      {column: localised(identifier + '.campaign') + ' ' + localised(identifier + '.name'), sortable: true, size: 'order-name', dmethod: :order_name_column},
      {column: localised(identifier + '.client'), dmethod: :reach_client_name},
      {column: localised(identifier + '.advertiser'), dmethod: :client_advertiser_name},
      {column: localised(identifier + '.am'), dmethod: :account_manager_column},
      {column: localised(identifier + '.start_date'), sortable: true, size: 'small', dmethod: :start_date},
      {column: localised(identifier + '.end_date'), sortable: true, size: 'small', dmethod: :end_date},
    ]
  end

  def table_columns
    if current_user.agency_user?
      agency_order_table_columns
    else
      order_table_columns
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
