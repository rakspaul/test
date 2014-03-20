json.set! :total_records, @fullcount
json.set! :records, @whitelisted_advertiser_groups do |whitelisted_advertiser_group|
  json.partial! 'blocked_advertiser_group', blocked_advertiser_group: whitelisted_advertiser_group
end