class TaskType < ActiveRecord::Base

  self.inheritance_column = 'task_type'

  belongs_to :owner, :foreign_key => 'default_assignee_id', :class_name => 'Team'

  validates :type, :presence => true
  validates :default_sla, :presence => true, :numericality => { :only_integer => true, :greater_than => 0 }
  validates :default_assignee_id, :presence => true

  attr_accessor :default_assignee_user_id, :default_assignee_user

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

  def set_default_assignee(order_id)
    lookup_field = self.owner.default_assignee_lookup_field

    if lookup_field
      table_name = self.owner.default_assignee_lookup_field[0...lookup_field.index('.')]
      result = self.class.find_by_sql("SELECT #{lookup_field} AS id, " <<
                                        "users.first_name || ' ' || users.last_name as type " <<
                                          " FROM #{table_name}, users WHERE order_id = #{order_id} " <<
                                          " and #{lookup_field} = users.id")

      self.default_assignee_user_id = (result.length == 0) ? nil : result[0].id
      self.default_assignee_user = (result.length == 0) ? nil : result[0].type
      logger.debug "default_assignee_user_id : #{default_assignee_user_id} default_assignee_user_id: #{default_assignee_user}"
      logger.debug "result : #{result[0].to_json}"
    end
  end

  private

  def total_holidays(date_range)
    date_range.select {|day| day.wday == 0 || day.wday == 6}.size
  end
end
