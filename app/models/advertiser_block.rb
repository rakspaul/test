class AdvertiserBlock < ActiveRecord::Base
  self.table_name = "network_advertiser_blocks"
  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end
end