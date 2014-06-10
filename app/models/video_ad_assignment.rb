class VideoAdAssignment < AdAssignment
  self.table_name = "video_assignments"

  belongs_to :ad, foreign_key: :ad_id
  belongs_to :video_creative
end
