class Segment < ActiveRecord::Base
  belongs_to :network

  def self.of_network(network)
    where(:network => network)
  end

  def full_name
    return "#{name} : #{friendly_name}" unless friendly_name.nil?
    return name
  end
end
