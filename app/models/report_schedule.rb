class ReportSchedule < ActiveRecord::Base
  self.table_name = "report_schedule"
  belongs_to :user

end	