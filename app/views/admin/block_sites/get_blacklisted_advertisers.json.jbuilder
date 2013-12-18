json.array! @blacklisted_advertisers do |blacklisted_advertiser|
  json.partial! 'blocked_advertiser', blocked_advertiser: blacklisted_advertiser
end