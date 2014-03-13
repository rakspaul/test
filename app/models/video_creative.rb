class VideoCreative < Creative
  self.table_name = "video_creatives"

  has_one :lineitem_assignment, dependent: :destroy, class_name: "LineitemVideoAssignment"
  has_one :lineitem, through: :lineitem_assignments

  has_many :ad_assignments, dependent: :destroy, class_name: "VideoAdAssignment"
  has_many :ads, through: :ad_assignments
end
