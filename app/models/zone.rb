class Zone < ActiveRecord::Base
  has_many :ads_zones
  has_many :ads, through: :ads_zones

end