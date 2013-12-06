class Context < ActiveRecord::Base
  belongs_to :network
  has_many :segments, :foreign_key => 'parent_id'

  def self.of_networks(networks)
    where(:network_id => networks)
  end

  def self.with_counts
    joins("LEFT JOIN segments ON (segments.parent_id = contexts.id)")
      .select("contexts.*, count(DISTINCT segments.id) as segment_count")
      .group(column_names.map {|c| "contexts.#{c}"}.join(', '))
  end
end
