class ScheduleReportsSerializer < ActiveModel::Serializer

  attributes :title, :email, :recalculate_dates, :start_date, :end_date, :frequency_value, :frequency_type, :report_start_date, :report_end_date, :status

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
    object.report_end_date.strftime("%Y-%m-%d")
  end

end
