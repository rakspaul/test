class MediaType < ActiveRecord::Base
  belongs_to :network
  has_many :platforms

  def self.of_network(network)
    where(:network => network)
  end

  def reachui_type?
    Object.const_get(self.category) rescue nil
  end
end
