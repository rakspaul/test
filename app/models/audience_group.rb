class AudienceGroup < ActiveRecord::Base
  self.table_name = "reach_audience_groups"

  belongs_to :network
  belongs_to :user

  validates :name, uniqueness: {message: 'already exist' }, presence: true
  validates :key_values, presence: true

  validate :key_value_list

  def self.of_network(network)
    where(:network => network)
  end

  def key_value_list
    unless key_values.empty?
      valid_commas

      segments_values = []
      contexts_values = []

      validate_key_value(segments_values, contexts_values)

      validate_segments(segments_values)
      validate_contexts(contexts_values)
    end
  end

  def valid_commas
    if key_values.last == "," || key_values.first == ","
      return errors.add :key_values, "Please enter a valid comma separated string."
    end
  end

  def validate_key_value(segments_vals, contexts_vals)
    kv_pairs = key_values.split(',')

    kv_pairs.each do|kv_pair|
      kv = kv_pair.split('=')
      if kv[0] == "btg"
        segments_vals << kv[1]
      elsif kv[0] == "contx"
        contexts_vals << kv[1]
      elsif kv[1].nil?
        return errors.add :key_values, "Missing key for the value '#{kv[0]}'"
      else
        return errors.add :key_values, "Invalid key '#{kv[0]}' for the value '#{kv[1]}'"
      end
    end
  end

  def find_duplicates(key_values)
    return key_values.select{|i| key_values.grep(i).size > 1}.uniq
  end

  def validate_segments(segments_to_search)
    duplicates = find_duplicates(segments_to_search)
    if duplicates.length > 0
      errors.add :key_values, "btg=#{duplicates.join(',')} already exists."
      return
    end

    networks = Rails.application.config.search_segments_in_network.split(',')

    segments_found = Segment.of_networks(networks).where(:name => segments_to_search).pluck(:name)
    missing_segments = segments_to_search - segments_found
    errors.add :key_values, "btg=#{missing_segments.join(',')} segment(s) does not exist." if missing_segments.length > 0
  end

  def validate_contexts(contexts_to_search)
    duplicates = find_duplicates(contexts_to_search)
    if duplicates.length > 0
      errors.add :key_values, "contx=#{duplicates.join(',')} already exists."
      return
    end

    networks = Rails.application.config.search_contexts_in_network.split(',')

    contexts_found = Context.of_networks(networks).where(:name => contexts_to_search).pluck(:name)
    missing_contexts = contexts_to_search - contexts_found
    errors.add :key_values, "contx=#{missing_contexts.join(',')} context(s) does not exist." if missing_contexts.length > 0
  end

end
