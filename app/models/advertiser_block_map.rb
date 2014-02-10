class AdvertiserBlockMap < ActiveRecord::Base
  self.table_name = "network_advertiser_block_maps"
  belongs_to :advertiser_block, :foreign_key => 'network_advertiser_block_id'
  belongs_to :advertiser, :foreign_key => 'network_advertiser_id'
end