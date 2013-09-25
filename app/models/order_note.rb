class OrderNote < ActiveRecord::Base
  self.table_name = "reach_order_notes"

  belongs_to :order
  belongs_to :user

  validates :note, presence: true

  def self.for_order(id)
    where(:order_id => id)
  end
end