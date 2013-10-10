json.array! @blocked_sites do |blocked_site|
  json.id blocked_site.id
  json.site_id blocked_site.site_id
  json.site_name blocked_site.site.name
  if blocked_site.type == "BlockedAdvertiser"
    json.advertiser_id blocked_site.advertiser_id
    json.advertiser_name blocked_site.advertiser.name
  else
    json.advertiser_group_id blocked_site.advertiser_group_id
    json.advertiser_group_name blocked_site.advertiser_block.name
  end
end