json.id note.id
json.note note.note
json.username note.user.try(:full_name).to_s
json.created_at format_datetime(note.created_at)
