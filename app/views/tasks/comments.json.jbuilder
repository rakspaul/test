json.array! @comments do |comment|
  json.created_by_id comment.created_by.try(:id)
  json.created_by comment.created_by.try(:full_name)
  json.created_at format_date_with_time(comment.created_at, :date_with_time)
  json.note comment.note
  json.activity_type comment.activity_type

  if comment.activity_attachment
    json.attachment_id comment.activity_attachment.id
    json.original_filename comment.activity_attachment.original_filename
  end

end
