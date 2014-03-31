json.set! :total_records, @fullcount
json.set! :records, @blacklisted_advertisers do |blacklisted_advertiser|
  json.partial! 'blocked_advertiser', blocked_advertiser: blacklisted_advertiser
end