class OrderNote < ActiveRecord::Base
  attr_accessor :username

  belongs_to :order
  belongs_to :user

  validates :note, presence: true

  def self.for_order(id)
    where(:order_id => id)
  end
end
