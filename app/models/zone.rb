class Zone < ActiveRecord::Base
  has_many :ads, through: :ads_zones

end