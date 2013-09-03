class AudienceGroup < ActiveRecord::Base
  self.table_name = "reach_audience_groups"
  belongs_to :network
  belongs_to :user

  validates :name, uniqueness: {message: 'already exist' }, presence: true
  validates :key_values, presence: true
  validate :key_value_list

  def key_value_list
    unless key_values.empty?
      segments_to_search = key_values.split(',')
      segments_found = Segment.of_network(network).where(:name => segments_to_search).pluck(:name)
      missing_segments = segments_to_search - segments_found
      errors.add :key_values, "#{missing_segments.join(',')} segment(s) does not exist." if missing_segments.length > 0
    end
  end

  def self.of_network(network)
    where(:network => network)
  end
end