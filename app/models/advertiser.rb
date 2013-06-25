class Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"
 
  belongs_to :network

  has_many :orders

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_name_or_id_or_source_id(search)
    where("name ilike :name or id = :id or source_id = :id_s", name: "%#{search}%", id: search.to_i, id_s: search)
  end
end
