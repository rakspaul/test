class BlockedAdvertiserBlock < BlockSite
  belongs_to :network
  belongs_to :user
  belongs_to :site
  belongs_to :advertiser_block, :foreign_key => 'advertiser_group_id'

  def self.of_network(network)
    where(:network => network)
  end
end