class AdSize < ActiveRecord::Base
  self.table_name = "slot_sizes_by_network"

  belongs_to :network
end
