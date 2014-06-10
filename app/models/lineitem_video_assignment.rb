class LineitemVideoAssignment < LineitemAssignment
  self.table_name = "lineitem_video_assignments"

  belongs_to :lineitem, foreign_key: :io_lineitem_id
  belongs_to :video_creative

  before_save :set_est_flight_dates

  # temporary fix [https://github.com/collectivemedia/reachui/issues/814]
  def start_date
    read_attribute_before_type_cast('start_date').try(:to_date)
  end

  def end_date
    read_attribute_before_type_cast('end_date').try(:to_date)
  end

private

  # temporary fix [https://github.com/collectivemedia/reachui/issues/814]
  def set_est_flight_dates
    if self[:start_date]
      start_date = read_attribute_before_type_cast('start_date').to_date
      current = "%.2i:%.2i:%.2i" % [Time.current.hour, Time.current.min, Time.current.sec]
      start_time = start_date.today? ? current : "00:00:00"
      self[:start_date] = "#{start_date} #{start_time}"
    end
    if self[:end_date]
      self[:end_date] = read_attribute_before_type_cast('end_date').to_date.to_s+" 23:59:59"
    end
  end
end
