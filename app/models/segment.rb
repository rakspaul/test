class Segment < ActiveRecord::Base
  belongs_to :network

  def self.of_network(network)
    where(:network_id => NetworkSegmap.select(:segment_network_id).of_network(network))
  end

end