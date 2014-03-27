json.array! @orders do |order|
  json.partial! 'order',
  {
    order: order,
    is_existing_order: true,
    io_original_filename: order.io_assets.try(:last).try(:asset_upload_name),
    io_created_at: order.io_assets.try(:last).try(:created_at).to_s,
    io_detail: order.io_detail,
    reach_client_id: order.io_detail.try(:reach_client).try(:id),
    reach_client_name: order.io_detail.try(:reach_client).try(:name),
    order_name_dup: false,
    sales_person_unknown: false,
    account_contact_unknown: false,
    billing_contact_unknown: false,
    media_contact_unknown: false,
    trafficking_contact_unknown: false,
    io_file_path: "",
    reach_client_name: order.io_detail.try(:reach_client).try(:name),
    reach_client_abbr: order.io_detail.try(:reach_client).try(:abbr)
  }
end
