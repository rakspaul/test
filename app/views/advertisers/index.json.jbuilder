json.array! @advertisers do |advertiser|
  json.id advertiser.id
  json.source_id advertiser.source_id
  json.name advertiser.name
end
