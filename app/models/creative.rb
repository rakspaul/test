class Creative < ActiveRecord::Base
  belongs_to :advertiser, foreign_key: :network_advertiser_id
  belongs_to :data_source
  belongs_to :network

  has_one :lineitem_assignment, dependent: :destroy
  has_one :lineitem, through: :lineitem_assignments

  has_many :ad_assignments, dependent: :destroy
  has_many :ads, through: :ad_assignments

  before_validation :sanitize_attributes
  before_create :create_random_source_id
  before_save :set_data_source

  scope :ordered_by_dates, lambda{ includes([ :lineitem_assignment, :ad_assignments ]).order("start_date ASC, size ASC") }

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

  def pushed_to_dfp?
    self.source_id.to_i != 0
  end

  def set_data_source
    self.data_source = self.network.data_source
  end

  def client_ad_id
    self.redirect_url.try(:match, /adid=(\d+);/).try(:[], 1) || self.html_code.try(:match, /"id"\s*:\s*"(\d+)"/).try(:[], 1)
  end

private

  def sanitize_attributes
    self.redirect_url = redirect_url.try(:strip)
  end
end
