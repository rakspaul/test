class City < ActiveRecord::Base
  has_and_belongs_to_many :ads, join_table: :city_targeting, foreign_key: :city_id
  has_and_belongs_to_many :lineitems, join_table: :cities_lineitems, foreign_key: :city_id

  scope :in_us, -> { where('country_code = ?', 'US')}
  scope :xfp_present, -> { where('xfp_id IS NOT NULL and xfp_targetable = true') }
end
