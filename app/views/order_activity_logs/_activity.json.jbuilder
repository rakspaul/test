json.id activity.id
json.note activity.note
json.created_at format_date(activity.created_at)
json.activity_type activity.activity_type
json.created_by activity.created_by.try(:full_name)

if activity.activity_attachment
  json.attachment do
    json.id activity.activity_attachment.id
    json.original_filename activity.activity_attachment.original_filename
  end
end

if activity.task
  json.task do
    json.id activity.task.id
    json.assignable_id activity.task.assignable_id
    json.due_date format_date(activity.task.due_date)
    json.completion_date activity.task.completion_date
    json.created_by_id activity.task.created_by_id
    json.created_by activity.task.created_by.try(:full_name)
    json.updated_by_id activity.task.updated_by_id
    json.updated_by activity.task.updated_by.try(:full_name)
    json.task_type_id activity.task.task_type_id
    json.task_type activity.task.task_type.try(:type)
    json.assignable_name activity.task.assignable.try(:full_name)
    json.created_at format_date(activity.task.created_at)
    json.updated_at format_date(activity.task.updated_at)
    json.task_state activity.task.task_state

  end
end