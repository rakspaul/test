class Task < ActiveRecord::Base

  # has_paper_trail :meta => { :title => :name }
  has_paper_trail ignore: [:updated_at]

  module TaskState
    ASSIGNED = 'assigned'
    COMPLETED = 'completed'
    CLOSED = 'closed'
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

  validates :name, :presence => true
  validates :task_type_id, :presence => true
  # validates :requested_by_id, presence: true
  validates :created_by_id, :presence => true
  # validates :updated_by_id, presence: true
  validates :order_id, :presence => true
  validates :task_state, :presence => true, :inclusion => { :in => TaskState.const_values }
  validate :validate_due_date, :if => :due_date_changed?

  before_save :fill_assignable, :if => lambda { self.assignable_id.nil? }

  def display_task_state
    case self.task_state
      when TaskState::ASSIGNED
        "created"
      when TaskState::COMPLETED
        "completed"
      when TaskState::CLOSED
        "closed"
    end
  end

  private

  def validate_due_date
    self.errors.add(:due_date, 'should be future date') if self.due_date <= Time.now
  end

  def fill_assignable
    self.assignable = self.task_type.owner if self.assignable_id.nil?
  end

end
