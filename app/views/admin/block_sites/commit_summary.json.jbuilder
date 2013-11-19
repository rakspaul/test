json.array! @site_blocks do |site_block|
  json.site_name site_block.site.name
  json.type site_block.type
  if site_block.type == "BlockedAdvertiser"
    json.advertiser_name site_block.advertiser.name
  else
    json.advertiser_group_name site_block.advertiser_block.name
  end
  json.username site_block.user.full_name
  json.state site_block.state
  json.updated_at format_datetime(site_block.updated_at)
  json.created_at format_datetime(site_block.created_at)
end