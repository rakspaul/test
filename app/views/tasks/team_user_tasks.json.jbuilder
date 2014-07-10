json.array! @user_tasks do |user_tasks|
  json.user do
    json.id user_tasks[:user].id
    json.name user_tasks[:user].try(:full_name)
  end

  json.tasks do
    json.array! user_tasks[:tasks] do |task|
      json.partial! "task", task: task
    end
  end
end