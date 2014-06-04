class TaskActivityLog < ActiveRecord::Base

  module ActivityType
    SYSTEM_COMMENT = 'system_comment'
    USER_COMMENT = 'user_comment'
    ALERT = 'alert'
    TASK = 'task'
    ATTACHMENT = 'attachment'
  end

  belongs_to :task
  belongs_to :created_by, :class_name => 'User'
  has_one :activity_attachment, :as => :activity_log

  validates :note, :presence => true
  validates :created_by_id, :presence => true
  validates :task_id, :presence => true
  validates :activity_type, :presence => true, :inclusion => { in: ActivityType.const_values }

  def self.recent_activity
    order(:created_at => :desc)
  end
end
