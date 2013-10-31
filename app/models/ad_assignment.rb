class AdAssignment < ActiveRecord::Base
  self.table_name = "assignments"

  belongs_to :ad, foreign_key: :ad_id
  belongs_to :creative

  before_validation :check_flight_dates_within_ad_flight_dates

private

  def check_flight_dates_within_ad_flight_dates
    if self.start_date.to_date < self.ad.start_date.to_date
      self.errors.add(:start_date, "couldn't be before ad's start date")
    end

    if self.end_date.to_date > self.ad.end_date.to_date
      self.errors.add(:end_date, "couldn't be after ad's end date")
    end
  end
end
