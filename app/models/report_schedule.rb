class ReportSchedule < ActiveRecord::Base
  self.table_name = "reach_schedule_reports"
  belongs_to :user

end	