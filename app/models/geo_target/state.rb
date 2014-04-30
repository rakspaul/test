class GeoTarget::State < GeoTarget

  belongs_to :country, primary_key: :source_id, foreign_key: :source_parent_id

  has_many :lineitem_geo_targetings, foreign_key: :geo_target_id
  has_many :lineitems, through: :lineitem_geo_targetings
  has_many :ad_geo_targetings, foreign_key: :geo_target_id
  has_many :ads, through: :ad_geo_targetings

  before_create :create_random_source_id

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

end
