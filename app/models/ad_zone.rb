class AdZone < ActiveRecord::Base
  self.table_name = "ads_zones"

  belongs_to :ad
  belongs_to :zone

end