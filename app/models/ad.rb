class Ad < ActiveRecord::Base
  belongs_to :order

  has_one :ad_pricing
end
