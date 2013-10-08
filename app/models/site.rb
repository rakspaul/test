class Site < ActiveRecord::Base
  belongs_to :network

  def self.of_networks(networks)
    where(:network_id => networks)
  end
end
