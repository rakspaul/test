json.partial! 'order', 
  {
    order: @order, 
    io_original_filename: @order.io_assets.try(:last).try(:asset_upload_name), 
    io_created_at: @order.io_assets.try(:last).try(:created_at).to_s, 
    io_detail: @order.io_detail,
    reach_client_id: @order.io_detail.try(:reach_client).try(:id),
    sales_person_unknown: false,
    account_manager_unknown: false,
    io_file_path: ""
  }
