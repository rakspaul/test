class BillingContacts < ActiveRecord::Base
  def self.for_user(id)
    where(:reach_client_id => id)
  end
end