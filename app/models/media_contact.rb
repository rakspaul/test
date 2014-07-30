class MediaContact < ActiveRecord::Base
  has_many :reach_clients

  validates :name, presence: true, uniqueness: { case_sensitive: false, scope: :reach_client_id }
  validates :email, presence: true, email: true, uniqueness: { case_sensitive: false, scope: :reach_client_id }

  def self.for_user(id)
    where(:reach_client_id => id)
  end

  def phone=(phone)
    write_attribute(:phone, phone.to_s.gsub(/\D/, ''))
  end
end
