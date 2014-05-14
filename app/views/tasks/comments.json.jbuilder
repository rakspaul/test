json.array! @comments do |comment|
    json.created_by comment[:commented_by]
    json.created_at format_date(comment[:created_at])
    json.text comment[:text]
end
