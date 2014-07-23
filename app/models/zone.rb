class Zone < ActiveRecord::Base
  has_many :ads_zones, class_name: "AdZone"
  has_many :ads, through: :ads_zones

  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end

  def self.of_site(site_id)
    where(:site_id => site_id)
  end
end