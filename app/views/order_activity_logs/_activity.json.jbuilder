json.id activity.id
json.note activity.note
json.created_at format_date(activity.created_at)
json.activity_type activity.activity_type
json.created_by activity.created_by.try(:full_name)