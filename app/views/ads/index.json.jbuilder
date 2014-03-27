json.array! @ads do |ad|
  json.ad do
    json.id ad.try(:id)
    json.description ad.description
    json.start_date format_date(ad.start_date)
    json.end_date format_date(ad.end_date)
    json.order_id ad.order_id
    json.size ad.size
    json.source_id ad.source_id
    json.dfp_url ad.dfp_url
    json.rate ad.ad_pricing.try(:rate).to_f
    json.volume ad.ad_pricing.try(:quantity).to_i
    json.value ad.ad_pricing.try(:value).to_f
    json.io_lineitem_id ad.io_lineitem_id
    json.keyvalue_targeting ad.reach_custom_kv_targeting
    json.targeted_zipcodes ad.zipcodes.collect{|zip| zip.zipcode}
    json.type ad.type
    json.media_type_id ad.media_type_id
  end

  json.creatives do
    json.array! (ad.ad_assignments + ad.video_ad_assignments) do |ad_assignment|
      creative = if ad_assignment.class.to_s == "VideoAdAssignment"
        ad_assignment.video_creative
      else
        ad_assignment.creative
      end

      json.id             creative.try(:id)
      json.ad_size        creative.size
      json.start_date     format_date(ad_assignment.try(:start_date))
      json.end_date       format_date(ad_assignment.try(:end_date))
      json.redirect_url   creative[:image_url] || creative.try(:redirect_url)

      json.client_ad_id   creative.client_ad_id
      json.source_id      creative.try(:source_id)
      json.html_code      h(creative.try(:html_code))
      json.html_code_excerpt html_code_excerpt(creative)

      json.creative_type  creative.try(:creative_type)
      json.io_lineitem_id ad.io_lineitem_id
      json.ad_id          ad.id
      json.li_assignment_id creative.try(:lineitem_assignment).try(:id)
      json.ad_assignment_id ad_assignment.id
    end
  end

  json.selected_geos do
    json.array! ad.designated_market_areas+ad.cities+ad.states do |geo|
      json.id (geo.respond_to?(:code) ? geo.code : geo.id)
      case geo.class.to_s
      when "DesignatedMarketArea"
        json.title "#{geo.name}"
        json.type "DMA"
      when "State"
        json.title "#{geo.name}/#{geo.country.try(:name)}"
        json.type "State"
      when "City"
        json.title "#{geo.name}/#{geo.region_name}/#{geo.country_code}"
        json.type "City"
      end
    end
  end

  json.selected_key_values do
    json.array! ad.audience_groups do |ag|
      json.id ag.id
      json.title ag.name
      json.key_values ag.key_values
    end
  end

  json.frequency_caps do
    json.array! ad.frequency_caps do |fc|
      json.impressions fc.cap_value
      json.time_value  fc.time_value
      json.time_unit   fc.time_unit
    end
  end
end
