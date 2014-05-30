json.array! @comments do |comment|
    json.created_by_id comment.created_by.try(:id)
    json.created_by comment.created_by.try(:full_name)
    json.created_at format_date(comment.created_at)
    json.note comment.note
    json.activity_type comment.activity_type
end
