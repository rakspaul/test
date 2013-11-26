class AdvertiserType < ActiveRecord::Base
  ADVERTISER_TYPE = "ADVERTISER"

  belongs_to :network

end