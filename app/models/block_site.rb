class BlockSite < ActiveRecord::Base
  self.table_name = "reach_sites_block"

  PENDING_BLOCK   = 'PENDING_BLOCK'
  PENDING_UNBLOCK = 'PENDING_UNBLOCK'
  BLOCK           = 'BLOCK'
  UNBLOCK         = 'UNBLOCK'

  belongs_to :network
  belongs_to :user
  belongs_to :site

  def self.of_network(network)
    where(:network => network)
  end
end