class Creative < ActiveRecord::Base
  has_one :lineitem_assignment
  has_one :lineitem, through: :lineitem_assignments

  has_one :ad_assignment, dependent: :destroy
  has_one :ad, through: :ad_assignments

  before_create :create_random_source_id

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end
end
