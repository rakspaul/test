class MediaType < ActiveRecord::Base
  belongs_to :network
  has_many :platforms

  def self.of_network(network)
    where(:network => network)
  end
end
