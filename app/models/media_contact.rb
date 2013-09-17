class MediaContact < ActiveRecord::Base
  has_many :reach_clients

  validates :name, :address, presence: true
  validates :email, uniqueness: {message: 'already exist' }, presence: true
  validates :phone, uniqueness: {message: 'already exist' }, presence: true, numericality: { only_integer: true, message: 'invalid number' }

  validates_format_of :email, :with => /^[a-z0-9_\+-]+(\.[a-z0-9_\+-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*\.([a-z]{2,4})$/, :message => "invalid email id", :multiline => true

  def self.for_user(id)
    where(:reach_client_id => id)
  end
end
