json.id order.id
json.source_id order.source_id
json.name order.name
json.active order.active

json.advertiser_name order.advertiser.name
json.advertiser_id order.advertiser.id

json.start_date format_date order.start_date
json.end_date format_date order.end_date

json.sales_person_name order.sales_person.try(:name)
json.sales_person_phone order.sales_person.try(:phone)
json.sales_person_email order.sales_person.try(:email)
json.sales_person_id order.sales_person.nil? ? nil : order.sales_person.id

json.user_id order.user.nil? ? nil : order.user.id
json.ocr_enabled !order.nielsen_campaign.nil?
json.created_at format_datetime(order.created_at)
json.updated_at format_datetime(order.updated_at)

json.io_asset_filename order.io_assets.try(:last).try(:asset_upload_name)
json.io_asset_created_at format_datetime(order.io_assets.try(:last).try(:created_at).to_s)

json.client_advertiser_name order.io_detail.client_advertiser_name
