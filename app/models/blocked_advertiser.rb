class BlockedAdvertiser < BlockSite
  belongs_to :network
  belongs_to :user
  belongs_to :site
  belongs_to :advertiser

  def self.of_network(network)
    where(:network => network)
  end
end