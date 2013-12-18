json.array! @blocked_sites do |blocked_site|
  json.partial! 'blocked_advertiser', blocked_advertiser: blocked_site
end