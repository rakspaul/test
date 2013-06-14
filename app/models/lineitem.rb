class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  belongs_to :order
end
