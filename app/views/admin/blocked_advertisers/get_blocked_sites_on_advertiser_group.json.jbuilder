json.array! @blocked_sites do |blocked_site|
  json.partial! 'blocked_advertiser_group', blocked_advertiser_group: blocked_site
end