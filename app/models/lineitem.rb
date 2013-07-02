class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  has_paper_trail ignore: [:updated_at]

  belongs_to :order
  belongs_to :user

  validates :name, :start_date, :end_date, :volume, :rate, presence: true
  validates :order, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :volume, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate, numericality: { greater_than_or_equal_to: 0 }
  validates :ad_sizes, ad_size: true
end
