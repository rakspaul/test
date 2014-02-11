class AdvertiserBlock < ActiveRecord::Base
  self.table_name = "network_advertiser_blocks"
  belongs_to :network
  has_many :advertiser_block_map, foreign_key: "network_advertiser_block_id"
  has_many :advertisers, :through => :advertiser_block_map

  def self.of_network(network)
    where(:network => network)
  end
end