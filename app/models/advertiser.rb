class Advertiser < ActiveRecord::Base
  self.table_name = "network_advertisers"
  default_scope { joins(:advertiser_type).where(advertiser_types: {name: AdvertiserType::ADVERTISER_TYPE}).readonly(false) }

  belongs_to :network
  belongs_to :data_source
  belongs_to :advertiser_type

  has_many :orders, foreign_key: :network_advertiser_id
  has_many :creatives, foreign_key: :network_advertiser_id

  before_create :create_random_source_id, :set_data_source, :make_advertiser_active
  before_save :set_data_source

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_name(search)
    where("network_advertisers.name ilike :name", name: "%#{search}%")
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
