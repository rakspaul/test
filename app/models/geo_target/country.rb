class GeoTarget::Country < GeoTarget

  has_many :states, primary_key: :source_id, foreign_key: :source_parent_id

end
