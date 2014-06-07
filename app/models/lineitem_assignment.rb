class LineitemAssignment < ActiveRecord::Base
  belongs_to :lineitem, foreign_key: :io_lineitem_id
  belongs_to :creative

  before_validation :check_flight_dates_within_li_flight_dates
  before_validation :check_end_date_after_start_date
  before_save :set_est_flight_dates

  # temporary fix [https://github.com/collectivemedia/reachui/issues/814]
  def start_date
    read_attribute_before_type_cast('start_date').try(:to_date)
  end

  def end_date
    read_attribute_before_type_cast('end_date').try(:to_date)
  end

private

  def check_flight_dates_within_li_flight_dates
    if self.start_date && self.start_date.to_date < self.lineitem.start_date.to_date
      self.errors.add(:start_date, "couldn't be before lineitem's start date")
    end

    if self.end_date && self.end_date.to_date > self.lineitem.end_date.to_date
      self.errors.add(:end_date, "couldn't be after lineitem's end date")
    end

    if self.end_date && self.end_date.to_date < self.lineitem.start_date.to_date
      self.errors.add(:end_date, "couldn't be before lineitem's start date")
    end

    if self.start_date && self.start_date.to_date > self.lineitem.end_date.to_date
      self.errors.add(:start_date, "couldn't be after lineitem's end date")
    end
  end

  def check_end_date_after_start_date
    if self.end_date && self.start_date && self.end_date.to_date < self.start_date.to_date
      self.errors.add(:end_date, "couldn't be before start date")
    end
  end

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
