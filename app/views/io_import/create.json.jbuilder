json.order do
  json.partial! 'orders/order', 
  {
    order: @io_import.order,
 
    io_original_filename: @io_import.original_filename, 
    io_created_at: Time.current.to_s, 
    io_detail: @io_details,
    order_name_dup: @io_import.order_name_dup,
    sales_person_unknown: @io_import.sales_person_unknown,
    account_contact_unknown: @io_import.account_contact_unknown,
    billing_contact_unknown: @io_import.billing_contact_unknown,
    media_contact_unknown: @io_import.media_contact_unknown,
    trafficking_contact_unknown: @io_import.trafficking_contact_unknown,
    reach_client_id: @io_import.reach_client.try(:id),
    reach_client_name: @io_import.reach_client.try(:name),
    reach_client_abbr: @io_import.reach_client.try(:abbr),
    io_file_path: @io_import.tempfile.path
  }

  json.notes do
    json.array! @notes do |note|
      json.username note[:username]
      json.note note[:note]
      json.created_at format_datetime(note[:created_at])
    end
  end

  json.billing_contacts do
    json.array! @io_import.billing_contacts do |bc|
      json.id bc.id
      json.name bc.name
    end
  end

  json.media_contacts do
    json.array! @io_import.media_contacts do |mc|
      json.id mc.id
      json.name mc.name
    end
  end

  json.reachui_users do
    json.array! @io_import.reachui_users do |u|
      json.id u.id
      json.name u.full_name
    end
  end
end

json.lineitems do
  json.array! @io_import.lineitems do |lineitem|
    json.partial! 'lineitems/lineitem.json.builder', lineitem: lineitem

    json.creatives do
      li_creatives = @io_import.inreds.select do |ir|
        ir[:placement]  == lineitem.name &&
        ir[:start_date] == lineitem.start_date &&
        ir[:end_date]   == lineitem.end_date
      end

      li_creatives_sorted_by_date_and_size = li_creatives.group_by{|cr| cr[:start_date] }.map do |start_date, arr| 
        arr.sort_by{|c| c[:ad_size]}
      end

      json.array! li_creatives_sorted_by_date_and_size.flatten do |inred|
        json.partial! 'creatives/creative.json.jbuilder', creative: inred
      end
    end
  end
end
