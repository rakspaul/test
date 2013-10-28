class LineitemAssignment < ActiveRecord::Base
  belongs_to :lineitem, foreign_key: :io_lineitem_id
  belongs_to :creative, dependent: :destroy

  before_validation :check_flight_dates_within_li_flight_dates

private

  def check_flight_dates_within_li_flight_dates
    if self.start_date.to_date < self.lineitem.start_date.to_date
      self.errors.add(:start_date, "couldn't be before lineitem's start date")
    end

    if self.end_date.to_date > self.lineitem.end_date.to_date
      self.errors.add(:start_date, "couldn't be after lineitem's end date")
    end
  end
end
