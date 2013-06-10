class Report::Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"

  belongs_to :network
  belongs_to :network, :foreign_key => :network_id
  
  has_many :orders

  def self.of_network(network_id)
    where(network_id: network_id)
  end
  
end  