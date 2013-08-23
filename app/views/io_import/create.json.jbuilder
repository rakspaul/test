json.order do
  json.partial! 'orders/order', 
  {
    order: @io_import.order, 
    io_original_filename: @io_import.original_filename, 
    io_created_at: Time.current.to_s, 
    io_detail: @io_details,
    sales_person_unknown: @io_import.sales_person_unknown,
    account_manager_unknown: @io_import.account_manager_unknown,
    reach_client_id: @io_import.reach_client.try(:id),
    io_file_path: @io_import.io_file_path
  }
end

json.lineitems do
  json.array! @io_import.lineitems do |lineitem|
    json.partial! 'lineitems/lineitem.json.builder', lineitem: lineitem
  end
end
