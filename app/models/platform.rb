class Platform < ActiveRecord::Base
  self.table_name = 'reach_platforms'

  belongs_to :network
  belongs_to :media_type
  belongs_to :site

  validates :name, presence: true, uniqueness: { case_sensitive: false, scope: [:media_type_id, :network_id] }

  validates :network_id, :media_type_id, :site_id, :priority, presence: true, numericality: { only_integer: true }

  validates :dfp_key, :ad_type, :naming_convention, presence: true

  def self.of_network(network)
    where(:network => network)
  end
end
