class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  has_paper_trail ignore: [:updated_at]

  belongs_to :order
  belongs_to :user

  has_one :nielsen_pricing, autosave: true

  validates :name, :start_date, :end_date, :volume, :rate, presence: true
  validates :order, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :volume, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate, numericality: { greater_than_or_equal_to: 0 }
  validates :ad_sizes, ad_size: true
  validate :flight_dates_with_in_order_range

  before_save :sanitize_ad_sizes
  after_create :create_nielsen_pricing

  private

    def flight_dates_with_in_order_range
      if(self.start_date < self.order.start_date)
        errors.add(:start_date, "can not be before start date of order")
      end

      if self.end_date > self.order.end_date
        errors.add(:end_date, "can not be after end date of order")
      end
    end

    def sanitize_ad_sizes
      self.ad_sizes.delete!(' ')
    end

    def create_nielsen_pricing
      nielsen_pricing.save! if nielsen_pricing
    end
end
