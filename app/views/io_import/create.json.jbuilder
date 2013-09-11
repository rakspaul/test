json.order do
  json.partial! 'orders/order', 
  {
    order: @io_import.order, 
    io_original_filename: @io_import.original_filename, 
    io_created_at: Time.current.to_s, 
    io_detail: @io_details,
    sales_person_unknown: @io_import.sales_person_unknown,
    account_contact_unknown: @io_import.account_contact_unknown,
    billing_contact_unknown: @io_import.billing_contact_unknown,
    media_contact_unknown: @io_import.media_contact_unknown,
    trafficking_contact_unknown: @io_import.trafficking_contact_unknown,
    reach_client_id: @io_import.reach_client.try(:id),
    reach_client_name: @io_import.reach_client.try(:name),
    io_file_path: @io_import.tempfile.path,
    reach_client_name: @io_import.reach_client.try(:name)
  }
end

json.lineitems do
  json.array! @io_import.lineitems do |lineitem|
    json.partial! 'lineitems/lineitem.json.builder', lineitem: lineitem
  end
end
