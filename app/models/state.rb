class State < ActiveRecord::Base
  belongs_to :country

  has_and_belongs_to_many :ads, join_table: :state_targeting, foreign_key: :state_id
  has_and_belongs_to_many :lineitems, join_table: :states_lineitems, foreign_key: :state_id

  before_create :create_random_source_id

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end
end
