class TaskType < ActiveRecord::Base

  self.inheritance_column = 'task_type'

  belongs_to :owner, :foreign_key => 'default_assignee_id', :class_name => 'Team'

  validates :type, :presence => true
  validates :default_sla, :presence => true, :numericality => { :only_integer => true, :greater_than => 0 }
  validates :default_assignee_id, :presence => true

  def default_due_date
    today = Time.now.to_date
    exclude_today = today + 1.day
    due_date = today + self.default_sla.days

    while((holidays = total_holidays(exclude_today..due_date)) > 0)
      exclude_today = due_date + 1.day
      due_date = due_date + holidays.days if holidays > 0
    end
    due_date
  end

  private

  def total_holidays(date_range)
    date_range.select {|day| day.wday == 0 || day.wday == 6}.size
  end
end
