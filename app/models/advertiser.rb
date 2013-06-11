class Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"

  belongs_to :network, :foreign_key => :network_id
  has_many :orders

  def self.of_network(network)
    where(:network => network)
  end

  def self.load_with_orders(network_id)
    select(['network_advertisers.name', 'orders.name']).
    from("network_advertisers, orders").
    where("network_advertisers.network_id = ?", network_id)
  end
  
end  