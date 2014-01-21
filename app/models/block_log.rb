class BlockLog < ActiveRecord::Base
  self.table_name = "reach_block_logs"

  belongs_to :site
  belongs_to :user
  belongs_to :advertiser
  belongs_to :advertiser_block, :foreign_key => 'advertiser_group_id'

  scope :filter_by_date, lambda {|start_date, end_date| where("reach_block_logs.created_at between (?) and (?)", start_date, end_date) unless start_date.blank? && end_date.blank?}
  scope :filter_by_site, lambda {|query| where("sites.name ILIKE ?", "%#{query}%") unless query.blank? }
  scope :filter_by_advertiser, lambda {|query| where("network_advertisers.name ILIKE ?", "%#{query}%") unless query.blank? }
  scope :filter_by_advertiser_group , lambda {|query| where("network_advertiser_blocks.name ILIKE ?", "%#{query}%") unless query.blank? }

  def self.of_network(network)
    where("users.company_id" => network.id)
  end
end
