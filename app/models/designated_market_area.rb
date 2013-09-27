class DesignatedMarketArea < ActiveRecord::Base
  default_scope { where.not(code: nil) }

  has_and_belongs_to_many :nielsen_campaign,
    join_table: 'dmas_nielsen_campaigns',
    foreign_key: 'dma_id'

  has_and_belongs_to_many :lineitems, join_table: :dmas_lineitems, foreign_key: :designated_market_area_id
  has_and_belongs_to_many :ads, join_table: :dma_targeting, foreign_key: :dma_id
end
