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
    json.media_type_id ad.lineitem.media_type_id
  end

  json.creatives do
    json.array! ad.ad_assignments do |ad_assignment|
      json.id             ad_assignment.creative.try(:id)
      json.ad_size        ad_assignment.creative.size
      json.start_date     format_date(ad_assignment.try(:start_date))
      json.end_date       format_date(ad_assignment.try(:end_date))
      json.redirect_url   ad_assignment.creative[:image_url] || ad_assignment.creative.redirect_url
      json.client_ad_id   ad_assignment.creative.redirect_url.try(:match, /adid=(\d+);/).try(:[], 1)
      json.source_id      ad_assignment.creative.try(:source_id)
      json.html_code      excerpt(ad_assignment.creative.try(:html_code), '"id" :', radius: 22)
      json.creative_type  ad_assignment.creative.try(:creative_type)
      json.io_lineitem_id ad.io_lineitem_id
      json.ad_id          ad.id
      json.li_assignment_id ad.lineitem.try(:id)
      json.ad_assignment_id ad_assignment.id
    end
  end

  json.selected_dmas do
    json.array! ad.designated_market_areas do |dma|
      json.id dma.code
      json.title dma.name
    end
  end

  json.selected_key_values do
    json.array! ad.audience_groups do |ag|
      json.id ag.id
      json.title ag.name
      json.key_values ag.key_values
    end
  end
end
