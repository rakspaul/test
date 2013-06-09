class Order < ActiveRecord::Base
  belongs_to :advertiser, :foreign_key => :network_advertiser_id
  belongs_to :network
  has_many :ads

  def self.of_network(network_id)
    where(network_id: network_id)
  end
end