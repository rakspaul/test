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
  belongs_to :assignable, :polymorphic => true

  # assignable_id
  # assignable_type

  has_many :task_activity_logs

  validates :name, :presence => true
  #uncomment the below line only
  # validates :task_type_id, :presence => true
  # validates :requested_by_id, presence: true
  validates :created_by_id, :presence => true
  # validates :updated_by_id, presence: true
  validates :order_id, :presence => true
  validates :task_state, :presence => true, :inclusion => { :in => TaskState.const_values }
  validate :validate_due_date, :if => :due_date_changed?

  private

  def validate_due_date
    self.errors.add(:due_date, 'should be future date') if self.due_date <= Time.now
  end
end
