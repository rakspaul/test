class SalesPeople < ActiveRecord::Base
  belongs_to :network

  has_many :orders

  def self.of_network(network)
    where(:network => network)
  end
end
