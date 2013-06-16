class Order < ActiveRecord::Base
  belongs_to :advertiser, foreign_key: :network_advertiser_id
  belongs_to :network

  has_many :lineitems, inverse_of: :order

  scope :latest_updated, -> { order("last_modified desc") }

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_id_or_source_id(id)
    where("id = :id or source_id = :id_s", id: id, id_s: id.to_s)
  end

end  
