class ReachClients < ActiveRecord::Base

  has_one :media_contacts, :foreign_key => 'reach_client_id'
  has_one :billing_contacts, :foreign_key => 'reach_client_id'

  belongs_to :sales_person, :foreign_key => 'sales_person_id', :class_name => "User"
  belongs_to :account_manager, :foreign_key => 'account_manager_id', :class_name => "User"
  belongs_to :trafficker, :foreign_key => 'trafficking_contact_id', :class_name => "User"
end