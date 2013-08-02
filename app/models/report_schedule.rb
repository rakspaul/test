class ReportSchedule < ActiveRecord::Base
  self.table_name = "reach_schedule_reports"
  belongs_to :user

  validates :title, :email, :user_id, :report_start_date, presence: true
  validate :validate_start_date, :validate_user_id, :validate_end_date_after_start_date
  validates_format_of :email, :with => /^[a-z0-9_\+-]+(\.[a-z0-9_\+-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*\.([a-z]{2,4})$/, :message => "Invalid email ID", :multiline => true

  private
    def validate_start_date
      errors.add :report_start_date, "can not be in past" if self.report_start_date < Time.zone.now.beginning_of_day
    end

    def validate_user_id
      errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
    end

    def validate_end_date_after_start_date
      if !self.report_end_date.nil?
        if(self.report_start_date >= self.report_end_date)
          errors.add :report_end_date, "can not be before start date"
        end
      end
    end

end