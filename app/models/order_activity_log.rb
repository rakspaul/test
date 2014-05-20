class OrderActivityLog < ActiveRecord::Base

  module ActivityType
    SYSTEM_COMMENT = 'system_comment'
    USER_COMMENT = 'user_comment'
    ALERT = 'alert'
    TASK = 'task'
    ATTACHMENT = 'attachment'
  end

  belongs_to :order
  belongs_to :created_by, :class_name => 'User'
end
