class BlockedAdvertiserGroup < BlockSite
  belongs_to :advertiser_block, :foreign_key => 'advertiser_group_id'
end