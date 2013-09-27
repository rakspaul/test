json.array! @order.ads do |ad|
  json.ad do
    json.description ad.description
    json.start_date ad.start_date
    json.end_date ad.end_date
    json.order_id ad.order_id
    json.size ad.size
    json.rate ad.rate
    json.io_lineitem_id ad.io_lineitem_id
    json.targeted_zipcodes ad.zipcodes.collect{|zip| zip.zipcode}
  end

  json.creatives do
    json.array! ad.creatives do |creative|
      json.partial! 'creatives/creative.json.jbuilder', creative: creative
    end
  end

  json.selected_dmas do
    json.array! ad.designated_market_areas do |dma|
      json.id dma.code
      json.title dma.name
    end
  end

  json.selected_key_values do
    json.array! ad.audience_groups.collect{|ag| ag.name}
  end
end
