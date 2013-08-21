class BillingContact < ActiveRecord::Base
  belongs_to :reach_client

  validates :phone, :reach_client_id, presence: true
  validates :email, email: true
end
