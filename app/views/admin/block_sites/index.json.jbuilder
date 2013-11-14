json.array! @blocked_sites do |blocked_site|
  json.id blocked_site.try("id")
  json.site_id blocked_site.try("site_id")
  json.site_name blocked_site.try("site").try("name")
  if blocked_site.type == "BlockedAdvertiser"
    json.advertiser_id blocked_site.try("advertiser_id")
    json.advertiser_name blocked_site.try("advertiser").try("name")
  else
    json.advertiser_group_id blocked_site.try("advertiser_group_id")
    json.advertiser_group_name blocked_site.try("advertiser_block").try("name")
  end
  json.state blocked_site.try("state")
  json.default_block blocked_site.try("default_block")
end