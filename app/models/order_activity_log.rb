class OrderActivityLog < ActiveRecord::Base

  module ActivityType
    SYSTEM_COMMENT = 'system_comment'
    USER_COMMENT = 'user_comment'
    ALERT = 'alert'
    TASK = 'task'
    ATTACHMENT = 'attachment'
    ALL = "all"
  end

  belongs_to :order
  belongs_to :created_by, :class_name => 'User'

  has_one :activity_attachment, :as => :activity_log
  has_one :task

  def self.system_comments
    where(:activity_type => ActivityType::SYSTEM_COMMENT)
  end

  def self.user_comments
    where(:activity_type => ActivityType::USER_COMMENT)
  end

  def self.alerts
    where(:activity_type => ActivityType::ALERT)
  end

  def self.tasks
    where(:activity_type => ActivityType::TASK)
  end

  def self.attachments
    where(:activity_type => ActivityType::ATTACHMENT)
  end

  def self.recent_activity
    order(:created_at => :desc)
  end

  def self.recent_user_comments
    user_comments.recent_activity
  end

  def self.recent_alerts
    alerts.recent_activity
  end
  def self.recent_tasks
    tasks.recent_activity
  end

  def self.recent_attachments
    attachments.recent_activity
  end

  def generate_system_comment
    case self.activity_type
      when ActivityType::TASK
        "#{self.created_by.full_name} #{self.task.display_task_state} a task"
      when ActivityType::ATTACHMENT
        "#{self.created_by.full_name} attached a file"
    end
  end


end
