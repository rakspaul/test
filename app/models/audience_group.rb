class AudienceGroup < ActiveRecord::Base
  self.table_name = "reach_audience_groups"

  belongs_to :network
  belongs_to :user

  has_and_belongs_to_many :lineitems, join_table: :lineitems_reach_audience_groups, foreign_key: :reach_audience_group_id
  has_and_belongs_to_many :ads, join_table: :ads_reach_audience_groups, foreign_key: :reach_audience_group_id

  validates :name, uniqueness: {message: 'already exist' }, presence: true
  validates :key_values, presence: true

  validate :key_value_list

  def self.of_network(network)
    where(:network => network)
  end

  def key_value_list
    unless key_values.empty?
      segments_to_search = key_values.split(',')

      if segments_to_search.length < 1
        errors.add :key_values, "Please enter a valid comma separated string."
        return
      end

      duplicates = find_duplicates(segments_to_search)
      if duplicates.length > 0
        errors.add :key_values, "#{duplicates.join(',')} already exists."
        return
      end

      networks = Rails.application.config.search_segments_in_network.split(',')

      segments_found = Segment.of_networks(networks).where(:name => segments_to_search).pluck(:name)
      missing_segments = segments_to_search - segments_found
      errors.add :key_values, "#{missing_segments.join(',')} segment(s) does not exist." if missing_segments.length > 0
    end
  end

  def find_duplicates(key_values)
    return key_values.select{|i| key_values.grep(i).size > 1}.uniq
  end

end
