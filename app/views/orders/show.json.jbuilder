json.partial! 'order', 
  {
    order: @order, 
    io_original_filename: @order.io_assets.details.try(:last).try(:asset_upload_name), 
    io_created_at: @order.io_assets.details.try(:last).try(:created_at).to_s, 
    io_detail: @order.io_detail,
    reach_client_id: @order.io_detail.try(:reach_client).try(:id),
    reach_client_name: @order.io_detail.try(:reach_client).try(:name),
    order_name_dup: false,
    sales_person_unknown: false,
    account_contact_unknown: false,
    billing_contact_unknown: false,
    media_contact_unknown: false,
    trafficking_contact_unknown: false,
    io_file_path: "",
    reach_client_name: @order.io_detail.try(:reach_client).try(:name),
    reach_client_abbr: @order.io_detail.try(:reach_client).try(:abbr)
  }

json.notes do
  json.array! @notes do |note|
    json.partial! 'order_notes/note.json.jbuilder', note: note
  end
end

json.billing_contacts do
  json.array! @billing_contacts do |bc|
    json.id bc.id
    json.name bc.name
    json.email bc.email
    json.phone bc.phone
  end
end

json.media_contacts do
  json.array! @media_contacts do |mc|
    json.id mc.id
    json.name mc.name
    json.email mc.email
    json.phone mc.phone
  end
end

json.reachui_users do
  json.array! @reachui_users do |u|
    json.id u.id
    json.name u.full_name
    json.email u.email
    json.phone u.phone_number
  end
end

json.io_creatives do
  json.array! @order.io_assets.io_creatives do |io_creative|
    json.asset_id io_creative.id
    json.original_filename io_creative.try(:asset_upload_name)
    json.asset_created_at format_datetime(io_creative.created_at)
  end
end

json.pushing_errors do
  json.array! @pushing_errors do |error|
    json.type    error.type
    json.message error.message
    json.creative_id error.creative_id
    json.ad_id   error.ad_id
    json.assignment_id error.assignment_id
  end
end
