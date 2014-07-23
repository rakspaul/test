class OrderActivityLog < ActiveRecord::Base

  module ActivityType
    SYSTEM_COMMENT = 'system_comment'
    USER_COMMENT = 'user_comment'
    ALERT = 'alert'
    TASK = 'task'
    ATTACHMENT = 'attachment'
    USER = 'user'
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

  def self.urgent_tasks
    tasks.where('tasks.important' => true)
  end

  def self.tasks
    result = joins(:task).where(:activity_type => ActivityType::TASK)
    result.order('tasks.task_state desc, tasks.important desc, tasks.due_date asc')
  end

  def self.attachments
    joins(:activity_attachment).where(:activity_type => ActivityType::ATTACHMENT)
  end

  def self.recent_activity(limit, offset=0)
    if(limit && offset)
      order(:created_at => :desc).limit(limit).offset(offset)
    else
      order(:created_at => :desc)
    end
  end

  def self.recent_user_comments(limit, offset=0)
    user_comments.recent_activity(limit, offset)
  end

  def self.recent_urgent_tasks(limit, offset=0)
    urgent_tasks.recent_activity(limit, offset)
  end

  def self.recent_tasks(limit, offset=0)
    tasks.recent_activity(limit, offset)
  end

  def self.recent_attachments(limit, offset=0)
    attachments.recent_activity(limit, offset)
  end

  def generate_system_comment
    if self.activity_type == ActivityType::ATTACHMENT
      "#{self.created_by.full_name} attached a file"
    end
  end

  def self.apply_filters filters, limit, offset=0
    where(activity_type: filters).order(created_at: :desc).limit(limit).offset(offset)
  end

  def self.apply_filters_with_user filters, user, limit, offset=0
    if(filters.length > 0)
      where(activity_type: filters, created_by_id: user.id).order(created_at: :desc).limit(limit).offset(offset)
    else
      where(created_by_id: user.id).order(created_at: :desc).limit(limit).offset(offset)
    end
  end

  ActivityType.const_values.each do |activity|
    define_method "#{activity}?".to_sym do
      self.activity_type == activity
    end
  end

end
