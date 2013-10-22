class Creative < ActiveRecord::Base
  belongs_to :advertiser, foreign_key: :network_advertiser_id

  has_one :lineitem_assignment
  has_one :lineitem, through: :lineitem_assignments

  has_many :ad_assignments, dependent: :destroy
  has_many :ad, through: :ad_assignments

  before_create :create_random_source_id

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

  def pushed_to_dfp?
    self.source_id.to_i != 0
  end
end
