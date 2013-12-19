json.array! @whitelisted_advertiser_groups do |whitelisted_advertiser_group|
  json.partial! 'blocked_advertiser_group', blocked_advertiser_group: whitelisted_advertiser_group
end