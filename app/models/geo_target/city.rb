class GeoTarget::City < GeoTarget

  belongs_to :state, primary_key: :source_id, foreign_key: :source_parent_id

  has_many :lineitem_geo_targetings, foreign_key: :geo_target_id
  has_many :lineitems, through: :lineitem_geo_targetings
  has_many :ad_geo_targetings, foreign_key: :geo_target_id
  has_many :ads, through: :ad_geo_targetings

end
