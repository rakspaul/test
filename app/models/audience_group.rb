class AudienceGroup < ActiveRecord::Base
  self.table_name = "reach_audience_groups"

  class_attribute :config
  self.config = Reachui::Application.config

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
    unless key_values.blank?
      segments_values = []
      contexts_values = []

      validate_key_value(segments_values, contexts_values)

      validate_segments(segments_values)
      validate_contexts(contexts_values)
    end
  end

  def validate_key_value(segments_vals, contexts_vals)
    kv_pairs = key_values.split(',')

    context_network = Network.find(config.search_contexts_in_network)

    kv_pairs.each do|kv_pair|
      kv = kv_pair.split('=')

      if kv[0].blank?
        return errors.add :key_values, "Missing key for the value #{kv[1]}"
      elsif kv[0] == "btg"
        segments_vals <<  kv[1]
      elsif kv[0] == "contx"
        contexts_vals << "#{context_network.net_prefix}.#{kv[1]}"
      else
        return errors.add :key_values, "Invalid key for the value #{kv[1]}"
      end

      if kv[1].blank?
        return errors.add :key_values, "Missing value for the key #{kv[0]}"
      end
    end
  end

  def validate_segments(segments_to_search)
    networks = config.search_segments_in_network.split(',')

    segments_found = Segment.of_networks(networks).where(:name => segments_to_search).pluck(:name)
    missing_segments = segments_to_search - segments_found
    errors.add :key_values, "btg=#{missing_segments.join(',')} segment(s) does not exist." if missing_segments.length > 0
  end

  def validate_contexts(contexts_to_search)
    contexts_found = Context.of_networks(config.search_contexts_in_network).where(:name => contexts_to_search).pluck(:name)
    missing_contexts = contexts_to_search - contexts_found
    remove_cm_contexts(missing_contexts)

    errors.add :key_values, "contx=#{missing_contexts.join(',')} context(s) does not exist." if missing_contexts.length > 0
  end

  def remove_cm_contexts(missing_contexts)
    missing_contexts.map! { |context|
      context.sub(/^[cm.]*/,"")
    }
  end

end
