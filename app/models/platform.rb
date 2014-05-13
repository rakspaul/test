class Platform < ActiveRecord::Base
  self.table_name = 'reach_platforms'

  attr_accessor :dfp_site_name
  cattr_accessor :current_network

  belongs_to :network
  belongs_to :media_type
  belongs_to :site

  validates :name, presence: true, uniqueness: { case_sensitive: false, scope: [:media_type_id, :network_id] }
  validates :network_id, :media_type_id, :priority, presence: true, numericality: { only_integer: true }
  validates :dfp_key, :ad_type, :naming_convention, :dfp_site_name, presence: true

  validate :check_dfp_site
  before_validation :strip_blanks

  def self.of_network(network)
    where(:network => network)
  end

  private
    def check_dfp_site
      dfp_site = Site.of_networks(current_network).where("lower(name) like lower(?)", self.dfp_site_name).first
      errors.add(:dfp_site_name, "does not exist") if dfp_site.blank?
      self[:site_id] = dfp_site.try(:id)
    end

    def strip_blanks
      self.name = self.name.try(:strip)
      self.dfp_key = self.dfp_key.try(:strip)
      self.naming_convention = self.naming_convention.try(:strip)
      self.dfp_site_name = self.dfp_site_name.try(:strip)
    end
end
