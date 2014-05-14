class Task < ActiveRecord::Base
  belongs_to :task_types
  belongs_to :users 
  belongs_to :orders
  belongs_to :task_states
  belongs_to :assignable, polymorphic: true
  
  has_many :task_activity_logs
  
end
