json.id                       order.id || existing_order_id
json.source_id                order.source_id
json.dfp_url                  order.dfp_url
json.name                     order.name
json.active                   order.active

json.advertiser_name          order.advertiser.try(:name)
json.advertiser_id            order.advertiser.try(:id)
json.advertiser_unknown       order.advertiser.blank? || order.advertiser.try(:advertiser_type).try(:name) != AdvertiserType::ADVERTISER_TYPE

json.start_date               format_date order.start_date
json.end_date                 format_date order.end_date

json.kpi_type                 order.kpi_type
json.kpi_value                order.kpi_value

json.order_status             io_detail.try(:state_desc)
json.state                    io_detail.try(:state).to_s
json.is_existing_order        is_existing_order

json.sales_person_name        io_detail.try(:sales_person).try(:full_name)
json.sales_person_phone       io_detail.try(:sales_person_phone)
json.sales_person_email       io_detail.try(:sales_person_email)
json.sales_person_id          io_detail.try(:sales_person).nil? ? nil : io_detail.sales_person.id

json.user_id                  order.user.nil? ? nil : order.user.id
json.assignee                 order.user.try(:full_name)
json.ocr_enabled              !order.nielsen_campaign.nil?
json.created_at               format_datetime(order.created_at)
json.updated_at               format_datetime(order.updated_at)

json.io_asset_filename        io_original_filename
json.io_asset_created_at      format_datetime(io_created_at)
json.revised_io_filename      revised_io_filename

json.client_advertiser_name   io_detail.try(:client_advertiser_name)

json.billing_contact_name     io_detail.try(:billing_contact).try(:name)
json.billing_contact_phone    io_detail.try(:billing_contact).try(:phone)
json.billing_contact_email    io_detail.try(:billing_contact).try(:email)

json.media_contact_name       io_detail.try(:media_contact).try(:name)
json.media_contact_email      io_detail.try(:media_contact).try(:email)
json.media_contact_phone      io_detail.try(:media_contact).try(:phone)

json.account_contact_name     io_detail.try(:account_manager).try(:full_name)
json.account_contact_phone    io_detail.try(:account_manager_phone) || io_detail.try(:account_manager).try(:phone_number)
json.account_contact_email    io_detail.try(:account_manager_email) || io_detail.try(:account_manager).try(:email)
json.account_contact_id       io_detail.try(:account_manager_id)

json.order_name_dup           order_name_dup
json.sales_person_unknown     sales_person_unknown
json.account_contact_unknown  account_contact_unknown
json.media_contact_unknown    media_contact_unknown
json.billing_contact_unknown  billing_contact_unknown
json.trafficking_contact_unknown trafficking_contact_unknown

json.reach_client_id          reach_client_id
json.reach_client_name        reach_client_name
json.reach_client_abbr        reach_client_abbr
json.reach_client_buffer      reach_client_buffer
json.reach_client_network_id  reach_client_network_id
json.io_file_path             io_file_path
json.client_order_id          io_detail.try(:client_order_id)

json.trafficking_contact_email io_detail.try(:trafficking_contact).try(:email)
json.trafficking_contact_name  io_detail.try(:trafficking_contact).try(:full_name)
json.trafficking_contact_id    io_detail.try(:trafficking_contact).try(:id)

