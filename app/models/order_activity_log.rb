class OrderActivityLog < ActiveRecord::Base
  belongs_to :orders
  belongs_to :activity_types
end
