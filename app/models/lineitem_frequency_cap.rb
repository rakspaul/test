class LineitemFrequencyCap < ActiveRecord::Base
  belongs_to :lineitem, foreign_key: 'io_lineitem_id'
  
  alias_attribute :impressions, :cap_value

  LIFETIME = 0
  MINUTES  = 1
  HOURS    = 2
  DAYS     = 3
  WEEKS    = 4
  MONTHS   = 5
end
