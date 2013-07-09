class ReportSchedule < ActiveRecord::Base
  has_many :schedule_histories, :foreign_key => "job_id", :dependent => :destroy
  belongs_to :user

end	