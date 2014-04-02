json.set! :total_records, @fullcount
json.set! :records, @whitelisted_advertisers do |whitelisted_advertiser|
  json.partial! 'blocked_advertiser', blocked_advertiser: whitelisted_advertiser
end
