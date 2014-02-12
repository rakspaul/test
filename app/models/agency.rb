class Agency < ActiveRecord::Base
  belongs_to :network
  has_many :users
  has_many :reach_clients

  def self.of_network(network)
    where(:network => network)
  end
end
