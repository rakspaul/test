FactoryGirl.define do

  factory :team do
    sequence(:name) {|n| "Team #{n}"}
  end

  factory :team_with_user, :parent => :team do
    after :create do |team|
      team.users = [FactoryGirl.singleton(:user)]
      team
    end
  end

  factory :task_type do
    type 'Creative'
    default_sla 1.week
    association :owner, :factory => :team
  end

  factory :task do
    sequence(:name) {|n| "Task name #{n}"}
    due_date 1.week.from_now
    association :created_by, :factory => :user
    task_type
    order
    task_state Task::TaskState::OPEN
  end

  factory :task_activity_log do
    task
    sequence(:note) {|n| "Note #{n}"}
    association :created_by, :factory => :user
    activity_type TaskActivityLog::ActivityType::SYSTEM_COMMENT
  end
end