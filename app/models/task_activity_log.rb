class TaskActivityLog < ActiveRecord::Base
  belongs_to :tasks
  belongs_to :activity_types
end
