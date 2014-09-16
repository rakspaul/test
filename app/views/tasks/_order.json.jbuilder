json.id task.id
json.name task.name
json.due_date format_date(task.due_date)
json.completion_date task.completion_date
json.created_by_id task.created_by_id
json.created_by task.created_by.try(:full_name)
json.updated_by_id task.updated_by_id
json.updated_by task.updated_by.try(:full_name)
json.task_type_id task.task_type_id
json.task_type task.task_type.try(:type)
json.requested_by_id task.requested_by_id
json.requested_by task.requested_by.try(:full_name)
json.order_id @order.try(:id)
json.order_name @order.try(:name)
json.assignable_id task.assignable_id
json.assignable_name task.assignable.try(:full_name)
json.assignable_type task.assignable_type
json.created_at format_date_with_time(task.created_at, :date_with_time)
json.task_state task.task_state
json.important task.important
json.comments_size task.task_activity_logs.get_user_comment_size
json.possible_task_actions possible_task_actions_for_current_user(task)

if task.activity_attachment
  json.attachment_id task.activity_attachment.id
  json.original_filename task.activity_attachment.original_filename
end