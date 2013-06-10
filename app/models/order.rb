class Order < ActiveRecord::Base
  belongs_to :advertiser, :foreign_key => :network_advertiser_id
  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end
end
