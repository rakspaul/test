class BlockedAdvertiserGroup < BlockSite
  belongs_to :advertiser_block, :foreign_key => 'advertiser_group_id'
  validates :advertiser_group_id, presence: true, numericality: { only_integer: true }
  validate :validate_advertiser_group_id

  def validate_advertiser_group_id
    errors.add :advertiser_group_id, "is invalid" unless AdvertiserBlock.exists?(self.advertiser_group_id)
  end
end