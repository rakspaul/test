class Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"

  belongs_to :network
  belongs_to :data_source
  belongs_to :advertiser_type

  has_many :orders
  has_many :creatives

  before_create :create_random_source_id, :set_data_source, :make_advertiser_active
  before_save :set_data_source

  scope :ofType, lambda { |network| joins(:advertiser_type).where("advertiser_types.name" => AdvertiserType::ADVERTISER_TYPE, "advertiser_types.network_id" => network) }

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_name_or_id_or_source_id(search)
    where("network_advertisers.name ilike :name or network_advertisers.id = :id or source_id = :id_s", name: "%#{search}%", id: search.to_i, id_s: search)
  end

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

  def set_data_source
    self.data_source = self.network.data_source
  end

  def make_advertiser_active
    self.active = true
    true
  end
end
