class Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"

  belongs_to :network

  has_many :orders
end
