class BillingContact < ActiveRecord::Base
  has_many :reach_clients

  validates :name, presence: true
  validates :email, presence: true, email: true

  def self.for_user(id)
    where(:reach_client_id => id)
  end

  def phone=(phone)
    write_attribute(:phone, phone.to_s.gsub(/\D/, ''))
  end
end
