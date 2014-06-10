class VideoAdAssignment < AdAssignment
  self.table_name = "video_assignments"

  belongs_to :ad, foreign_key: :ad_id
  belongs_to :video_creative

  before_create :set_est_flight_dates
  before_update :check_est_flight_dates

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

  def check_est_flight_dates
    if start_date_changed?
      start_date, _ = read_attribute_before_type_cast('start_date').to_s.split(' ')
      _, start_time_was = start_date_was.to_s(:db).split(' ')
      self[:start_date] = "#{start_date} #{start_time_was}"
    end
    if end_date_changed?
      end_date, _ = read_attribute_before_type_cast('end_date').to_s.split(' ')
      _, end_time_was = end_date_was.to_s(:db).split(' ')
      self[:end_date] = "#{end_date} #{end_time_was}"      
    end
  end
end
