class BlockedAdvertiser < BlockSite
  belongs_to :advertiser
  validates :advertiser_id, presence: true, numericality: { only_integer: true }
  validate :validate_advertiser_id

  def validate_advertiser_id
    errors.add :advertiser_id, "is invalid" unless Advertiser.exists?(self.advertiser_id)
  end
end