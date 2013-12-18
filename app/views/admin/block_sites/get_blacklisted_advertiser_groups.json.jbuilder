json.array! @blacklisted_advertiser_groups do |blacklisted_advertiser_group|
  json.partial! 'blocked_advertiser_group', blocked_advertiser_group: blacklisted_advertiser_group
end