class MediaContact < ActiveRecord::Base
  belongs_to :reach_client

  validates :name, :phone, :email, :reach_client_id, presence: true
  validates :email, email: true
end
