class BlockViolations < ActiveRecord::Base
  self.table_name = "reach_block_violations"

  belongs_to :site
  belongs_to :ad
  belongs_to :advertiser
end