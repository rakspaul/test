class DesignatedMarketArea < ActiveRecord::Base
  self.primary_key = "code"

  default_scope { where.not(code: nil) }

  has_and_belongs_to_many :nielsen_campaign,
    join_table: 'dmas_nielsen_campaigns',
    foreign_key: 'dma_id'
end
