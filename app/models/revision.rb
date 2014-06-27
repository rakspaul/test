class Revision < ActiveRecord::Base
  belongs_to :order

  validates :order_id, :object_changes, presence: true
end
