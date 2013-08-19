class ReachClients < ActiveRecord::Base

  belongs_to :network
  belongs_to :media_contacts, :foreign_key => 'media_contact_id'
  belongs_to :billing_contacts, :foreign_key => 'billing_contact_id'

  belongs_to :sales_person, :foreign_key => 'sales_person_id', :class_name => "User"
  belongs_to :account_manager, :foreign_key => 'account_manager_id', :class_name => "User"
  belongs_to :trafficker, :foreign_key => 'trafficking_contact_id', :class_name => "User"

  def self.of_network(network)
    where(:network => network)
  end

  def self.of_network_by_id(network, id)
    of_network(network).where(:id => id).first
  end
end