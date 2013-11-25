json.array! @default_site_blocks do |default_site_block|
  json.id default_site_block.site_id
  json.name default_site_block.site.name
end