class Platform < ActiveRecord::Base
  self.table_name = 'reach_platforms'

  attr_accessor :dfp_site_name

  belongs_to :network
  belongs_to :media_type
  belongs_to :site

  validates :name, presence: true, uniqueness: { case_sensitive: false, scope: [:media_type_id, :network_id] }
  validates :network_id, :media_type_id, :priority, :site_id, presence: true, numericality: { only_integer: true }
  validates :dfp_key, :ad_type, :naming_convention, :dfp_site_name, :zone, presence: true
  validate :check_dfp_site

  before_validation :strip_blanks

  def self.of_network(network)
    where(:network => network)
  end

  private
    def check_dfp_site
      unless self.dfp_site_name.blank?
        errors.add :dfp_site_name, "does not exist" if self.site_id.blank?
      end
    end

    def strip_blanks
      self.name = self.name.try(:strip)
      self.dfp_key = self.dfp_key.try(:strip)
      self.zone = self.zone.try(:strip)
      self.naming_convention = self.naming_convention.try(:strip)
      self.dfp_site_name = self.dfp_site_name.try(:strip)
      self.tag_template = self.tag_template.blank? ? nil : self.tag_template.strip
    end
end
