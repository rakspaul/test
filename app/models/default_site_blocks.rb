class DefaultSiteBlocks < ActiveRecord::Base
  self.table_name = "reach_default_site_blocks"

  belongs_to :network
  belongs_to :user
  belongs_to :site

  validates :site_id, :network_id, :user_id, presence: true, numericality: { only_integer: true }
  validate :validate_site_id, :validate_network_id, :validate_user_id

  def validate_site_id
    errors.add :site_id, "is invalid" unless Site.exists?(self.site_id)
  end

  def validate_network_id
    errors.add :network_id, "is invalid" unless Network.exists?(self.network_id)
  end

  def validate_user_id
    errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
  end

  def self.of_network(network)
    where(:network => network)
  end
end