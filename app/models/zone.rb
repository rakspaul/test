class Zone < ActiveRecord::Base
  has_many :ads_zones, class_name: "AdZone"
  has_many :ads, through: :ads_zones

  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end
end