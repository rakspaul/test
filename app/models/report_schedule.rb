class ReportSchedule < ActiveRecord::Base
  self.table_name = "reach_schedule_reports"
  belongs_to :user

  validates :start_date, :end_date, :report_start_date, presence: true
  validate :validate_start_date, on: :create

  private
    def validate_start_date
      errors.add :start_date, "can not be in past" if self.start_date < Time.zone.now.beginning_of_day
    end

end	