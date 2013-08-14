class BillingContact < ActiveRecord::Base
  belongs_to :reach_client

  validates_presence_of :phone, :reach_client_id
  validates_format_of :email, with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/
end
