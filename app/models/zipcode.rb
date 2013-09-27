class Zipcode < ActiveRecord::Base

  has_and_belongs_to_many :ads, join_table: :zipcode_targeting
end
