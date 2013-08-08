class ScheduleReportsSerializer < ActiveModel::Serializer

  attributes :id, :title, :email, :recalculate_dates, :start_date, :end_date,
     :url, :last_ran, :frequency_value, :frequency_type, :report_start_date,
     :report_end_date, :status, :created_at, :updated_at

  def start_date
    object.start_date.strftime("%Y-%m-%d")
  end

  def end_date
    object.end_date.strftime("%Y-%m-%d")
  end

  def report_start_date
    object.report_start_date.strftime("%Y-%m-%d")
  end

  def report_end_date
    object.report_end_date.nil? ? "" : object.report_end_date.strftime("%Y-%m-%d")
  end

  def created_at
    object.created_at.strftime("%Y-%m-%d")
  end

  def updated_at
    object.updated_at.strftime("%Y-%m-%d")
  end

end
