class AdSize < ActiveRecord::Base
  self.table_name = "slot_sizes_by_network"

  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end
end
