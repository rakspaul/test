json.array! @task_types do |type|
  json.id type.id
  json.type type.type
  json.default_due_date format_date(type.default_due_date)
  json.default_assignee_id type.owner.id
  json.default_assignee_team type.owner.name

  json.users do
    json.array! type.owner.users do |user|
      json.id user.id
      json.name user.full_name
    end
  end
end