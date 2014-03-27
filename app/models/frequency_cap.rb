class FrequencyCap < ActiveRecord::Base
  belongs_to :ad

  LIFETIME = 0
  MINUTES  = 1
  HOURS    = 2
  DAYS     = 3
  WEEKS    = 4
  MONTHS   = 5
end
