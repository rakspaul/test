class BlockSite < ActiveRecord::Base
  self.table_name = "reach_sites_block"

  attr_writer :visited, :default_block

  PENDING_BLOCK   = 'PENDING_BLOCK'
  PENDING_UNBLOCK = 'PENDING_UNBLOCK'
  BLOCK           = 'BLOCK'
  UNBLOCK         = 'UNBLOCK'
  COMMIT_BLOCK    = 'COMMIT_BLOCK'
  COMMIT_UNBLOCK  = 'COMMIT_UNBLOCK'

  BLOCKED_ADVERTISER = 'BlockedAdvertiser'
  BLOCKED_ADVERTISER_GROUP = 'BlockedAdvertiserGroup'

  belongs_to :network
  belongs_to :user
  belongs_to :site

  validates :type, presence: true
  validates :state, :inclusion => { :in => [BlockSite::PENDING_BLOCK, BlockSite::PENDING_UNBLOCK, BlockSite::BLOCK, BlockSite::UNBLOCK, BlockSite::COMMIT_BLOCK, BlockSite::COMMIT_UNBLOCK]}
  validates :site_id, :network_id, :user_id, presence: true, numericality: { only_integer: true }
  validate :validate_site_id, :validate_network_id, :validate_user_id

  def validate_site_id
    errors.add :site_id, "is invalid" unless Site.exists?(self.site_id)
  end

  def validate_network_id
    errors.add :network_id, "is invalid" unless Network.exists?(self.network_id)
  end

  def validate_user_id
    errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
  end

  def self.of_network(network)
    where(:network => network)
  end

  def self.block_or_pending_block
    where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK, BlockSite::COMMIT_BLOCK])
  end

  def self.block_or_pending_block_or_pending_unblock
    where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK, BlockSite::COMMIT_BLOCK, BlockSite::PENDING_UNBLOCK ])
  end

  def self.pending_block
    where(state: [BlockSite::PENDING_BLOCK])
  end

  def self.unblock_or_pending_unblock
    where(state: [BlockSite::PENDING_UNBLOCK, BlockSite::UNBLOCK, BlockSite::COMMIT_UNBLOCK ])
  end

  def self.unblock_or_pending_unblock_pending_block
    where(state: [BlockSite::PENDING_UNBLOCK, BlockSite::UNBLOCK, BlockSite::COMMIT_UNBLOCK, BlockSite::PENDING_BLOCK ])
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