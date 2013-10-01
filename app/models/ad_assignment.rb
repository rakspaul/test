class AdAssignment < ActiveRecord::Base
  self.table_name = "assignments"

  belongs_to :ad, foreign_key: :ad_id
  belongs_to :creative, dependent: :destroy
end
