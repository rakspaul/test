class BlockSite < ActiveRecord::Base
  self.table_name = "reach_sites_block"

  attr_writer :visited

  PENDING_BLOCK   = 'PENDING_BLOCK'
  PENDING_UNBLOCK = 'PENDING_UNBLOCK'
  BLOCK           = 'BLOCK'
  UNBLOCK         = 'UNBLOCK'

  BLOCKED_ADVERTISER = 'BlockedAdvertiser'
  BLOCKED_ADVERTISER_GROUP = 'BlockedAdvertiserGroup'

  belongs_to :network
  belongs_to :user
  belongs_to :site

  def self.of_network(network)
    where(:network => network)
  end

  def visited
    @visited || false
  end

end