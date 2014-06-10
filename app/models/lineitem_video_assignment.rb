class LineitemVideoAssignment < LineitemAssignment
  self.table_name = "lineitem_video_assignments"

  belongs_to :lineitem, foreign_key: :io_lineitem_id
  belongs_to :video_creative
end
