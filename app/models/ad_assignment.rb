class AdAssignment < ActiveRecord::Base
  self.table_name = "assignments"

  belongs_to :ad, foreign_key: :ad_id
  belongs_to :creative
  belongs_to :data_source
  belongs_to :network

  before_validation :check_flight_dates_within_ad_flight_dates
  before_validation :check_end_date_after_start_date
  before_save :set_data_source

private

  def set_data_source
    self.data_source = self.network.data_source
  end

  def check_flight_dates_within_ad_flight_dates
    if self.start_date.to_date < self.ad.start_date.to_date
      self.errors.add(:start_date, "couldn't be before ad's start date")
    end

    if self.end_date.to_date > self.ad.end_date.to_date
      self.errors.add(:end_date, "couldn't be after ad's end date")
    end

    if self.end_date.to_date < self.ad.start_date.to_date
      self.errors.add(:end_date, "couldn't be before ad's start date")
    end

    if self.start_date.to_date > self.ad.end_date.to_date
      self.errors.add(:start_date, "couldn't be after ad's end date")
    end
  end

  def check_end_date_after_start_date
    if self.end_date.to_date < self.start_date.to_date
      self.errors.add(:end_date, "couldn't be before start date")
    end
  end
end
