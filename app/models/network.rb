class Network < ActiveRecord::Base
  self.inheritance_column = :ctype
  self.table_name = "companies"

  has_many :ad_sizes
end
