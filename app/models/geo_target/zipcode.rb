class GeoTarget::Zipcode < GeoTarget

  has_many :ad_geo_targetings, foreign_key: :geo_target_id
  has_many :ads, through: :ad_geo_targetings

end
