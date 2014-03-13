class BlockViolations < ActiveRecord::Base
  self.table_name = "reach_block_violations"

  belongs_to :site
  belongs_to :ad
  belongs_to :advertiser

  scope :filter_by_date, lambda {|start_date, end_date| where("reach_block_violations.created_at between (?) and (?)", start_date, end_date) unless start_date.blank? && end_date.blank?}
  scope :filter_by_site, lambda {|query| where("sites.name ILIKE ?", "%#{query}%") unless query.blank? }
  scope :filter_by_advertiser, lambda {|query| where("network_advertisers.name ILIKE ?", "%#{query}%") unless query.blank? }
end