class VideoAdAssignment < AdAssignment
  self.table_name = "video_assignments"

  belongs_to :ad, foreign_key: :ad_id
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
      self[:start_date] = read_attribute_before_type_cast('start_date').to_date.to_s+" 00:00:00"
    end
    if self[:end_date]
      self[:end_date] = read_attribute_before_type_cast('end_date').to_date.to_s+" 23:59:59"
    end
  end
end
