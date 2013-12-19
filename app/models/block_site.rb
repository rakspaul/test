class BlockSite < ActiveRecord::Base
  self.table_name = "reach_sites_block"

  attr_writer :visited, :default_block

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

  def self.block_or_pending_block
    where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK])
  end

  def self.pending_block
    where(state: [BlockSite::PENDING_BLOCK])
  end

  def self.unblock_or_pending_unblock
    where(state: [BlockSite::PENDING_UNBLOCK, BlockSite::UNBLOCK])
  end

  def self.pending_unblock
    where(state: [BlockSite::PENDING_UNBLOCK])
  end

  def self.for_advertiser(advertiser_ids)
    where(advertiser_id: advertiser_ids)
  end

  def self.for_advertiser_group(advertiser_group_ids)
    where(advertiser_group_id: advertiser_group_ids)
  end

  def visited
    @visited || false
  end

  def default_block
    @default_block || false
  end

end