class NetworkSegmap < ActiveRecord::Base
  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end
end