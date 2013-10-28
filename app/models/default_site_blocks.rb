class DefaultSiteBlocks < ActiveRecord::Base
  self.table_name = "reach_default_site_blocks"

  belongs_to :network
  belongs_to :user
  belongs_to :site

  def self.of_network(network)
    where(:network => network)
  end
end