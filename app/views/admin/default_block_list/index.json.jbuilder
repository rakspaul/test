json.array! @default_site_blocks do |default_site_block|
  json.id default_site_block.id
  json.site_id default_site_block.site_id
  json.site_name default_site_block.site.name
end