class MediaContacts < ActiveRecord::Base
  has_many :reach_clients

  def self.for_user(id)
    where(:reach_client_id => id)
  end
end