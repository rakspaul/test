class Task < ActiveRecord::Base

  # has_paper_trail :meta => { :title => :name }
  has_paper_trail ignore: [:updated_at]

  module TaskState
    OPEN = 'open'
    COMPLETE = 'complete'
    CLOSE = 'close'
  end

  belongs_to :task_type
  belongs_to :requested_by, :class_name => 'User'
  belongs_to :created_by, :class_name => 'User'
  belongs_to :updated_by, :class_name => 'User'
  belongs_to :order
  belongs_to :order_activity_log
  belongs_to :assignable, :polymorphic => true

  has_one :activity_attachment, :as => :activity_log

  has_many :task_activity_logs
  has_many :activity_attachments, :through => :task_activity_logs

  validates :name, :presence => true, :uniqueness => { :scope => :order_id, :case_sensitive => false }
  validates :task_type_id, :presence => true
  # validates :requested_by_id, presence: true
  validates :created_by_id, :presence => true
  # validates :updated_by_id, presence: true
  validates :order_id, :presence => true
  validates :task_state, :presence => true, :inclusion => { :in => TaskState.const_values }
  validate :validate_due_date, :if => :due_date_changed?

  before_save :fill_assignable, :if => lambda { self.assignable_id.nil? }

  before_create :update_activity_log

  before_update :update_activity_logs

  def self.recent
    order(:id => :desc)
  end

  def self.fetch_assigned_to_me_tasks(user, limit, offset)
    result = where(assignable_id: user.id, assignable_type: 'User')
    result = result.limit(limit).offset(offset) if limit && offset
    result
  end

  private

  def validate_due_date
    self.errors.add(:due_date, 'should be future date') if self.due_date <= Time.now
  end

  def fill_assignable
    self.assignable = self.task_type.owner if self.assignable_id.nil?
  end

  def update_activity_logs
    note = if task_state_changed?
             if (task_state_was == TaskState::OPEN && task_state == TaskState::COMPLETE)
               " completed the task"
             elsif (task_state_was == TaskState::COMPLETE && task_state == TaskState::CLOSE)
                 " closed the task"
             elsif (task_state_was == TaskState::OPEN && task_state == TaskState::CLOSE)
               " closed the task"
             elsif (task_state_was == TaskState::CLOSE && task_state == TaskState:: OPEN)
               " reopened the task"
             elsif (task_state_was == TaskState::COMPLETE && task_state == TaskState:: OPEN)
               " reopened the task"
             end
           end

    note = " changed the due date " if due_date_changed?

    note = " marked the task #{important ? 'urgent' : 'non-urgent'}" if important_changed?

    return if note.nil?

    note = updated_by.full_name + note

    puts note

    need_to_update_order_activity = true
    order_activity_note = ""
    if task_state_changed?
      order_activity_note = name + ": "+note
    elsif due_date_changed?
      order_activity_note = name + ": "+note
    elsif important_changed?
      order_activity_note = name + ": "+updated_by.full_name + " marked the task #{important ? 'urgent' : 'non-urgent'}"
    else
      need_to_update_order_activity = false
    end

    if need_to_update_order_activity
      order_activity_log = OrderActivityLog.new :order_id => self.order_id, :note => order_activity_note,
                           :activity_type => OrderActivityLog::ActivityType::SYSTEM_COMMENT,
                           :created_by_id => updated_by_id

      order_activity_log.save
    end

    task_activity_log = TaskActivityLog.new :task_id => self.id, :note => note,
                                        :activity_type => OrderActivityLog::ActivityType::SYSTEM_COMMENT,
                                        :created_by_id => updated_by_id

    task_activity_log.save
  end

  def update_activity_log
    #system comment
    note = created_by.full_name + " created a task: "+ name
    order_activity_log = OrderActivityLog.new :order_id => self.order_id, :note => note,
                                              :activity_type => OrderActivityLog::ActivityType::SYSTEM_COMMENT,
                                              :created_by_id => created_by_id
    order_activity_log.save

    #user comment
    activity = OrderActivityLog.new :order_id => self.order_id, :note => name,
                                    :activity_type => OrderActivityLog::ActivityType::TASK,
                                    :created_by => created_by
    activity.save!

    self.order_activity_log = activity
  end
end
