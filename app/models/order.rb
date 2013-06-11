class Order < ActiveRecord::Base
  belongs_to :network
  belongs_to :advertiser, :foreign_key => :network_advertiser_id

  has_many :ads

  def self.of_network(network)
    where(:network => network)
  end

  def self.load_with_advertiser(network_id)
    select(['orders.*', 'network_advertisers as advertiser']).
    joins("INNER JOIN network_advertisers ON (network_advertisers.id = orders.network_advertiser_id)").
    where("orders.network_id = ?", network_id)
  end

end  