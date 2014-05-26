json.array! @comments do |comment|
    json.created_by_id comment.created_by.id
    json.created_by_name comment.created_by.full_name
    json.created_at format_date(comment.created_at)
    json.text comment.note
end
