class BlockViolations < ActiveRecord::Base
  self.table_name = "reach_block_violations"

  belongs_to :site, :primary_key => 'source_id', :class_name => "Site"
  belongs_to :ad, :primary_key => 'source_id', :class_name => "Ad"
  belongs_to :advertiser

end