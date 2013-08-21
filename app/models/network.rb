class Network < ActiveRecord::Base
  self.inheritance_column = :ctype
  self.table_name = "companies"

  belongs_to :data_source

  has_many :ad_sizes
  has_many :users, :foreign_key => "company_id"
end
