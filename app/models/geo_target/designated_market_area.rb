class GeoTarget::DesignatedMarketArea < GeoTarget

  has_and_belongs_to_many :nielsen_campaign,
    join_table: 'dmas_nielsen_campaigns',
    foreign_key: 'dma_id'

  has_many :lineitem_geo_targetings, foreign_key: :geo_target_id
  has_many :lineitems, through: :lineitem_geo_targetings
  has_many :ad_geo_targetings, foreign_key: :geo_target_id
  has_many :ads, through: :ad_geo_targetings

end
