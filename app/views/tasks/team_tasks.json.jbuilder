json.team do
  json.id @team_tasks[:team].id
  json.name @team_tasks[:team].try(:full_name)
end

json.tasks do
  json.array! @team_tasks[:tasks] do |task|
    json.partial! "task", task: task
  end
end
