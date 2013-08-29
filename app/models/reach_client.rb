class ReachClient < ActiveRecord::Base

  belongs_to :network
  belongs_to :media_contact, :foreign_key => 'media_contact_id'
  belongs_to :billing_contact, :foreign_key => 'billing_contact_id'

  belongs_to :sales_person, :foreign_key => 'sales_person_id', :class_name => "User"
  belongs_to :account_manager, :foreign_key => 'account_manager_id', :class_name => "User"

  validates :name, :abbr, :address, presence: true

  validates :network_id, :user_id, :sales_person_id, :account_manager_id, presence: true, numericality: { only_integer: true }

  validates :media_contact_id, :billing_contact_id, presence: true, numericality: { only_integer: true }, on: :update

  validate :validate_network_id, :validate_user_id, :validate_sales_person, :validate_account_manager, :validate_sales_person_account_manager

  def validate_network_id
    errors.add :network_id, "is invalid" unless Network.exists?(self.network_id)
  end

  def validate_user_id
    errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
  end

  def validate_sales_person
    errors.add :sales_person_id, "is invalid" unless User.exists?(self.sales_person_id)
  end

  def validate_account_manager
    errors.add :account_manager_id, "is invalid" unless User.exists?(self.account_manager_id)
  end

  def validate_sales_person_account_manager
    unless sales_person_id.nil? && sales_person_id.nil? && trafficking_contact_id.nil?
      sales_person = Network.find(self.network_id).users.exists?(sales_person_id)
      account_manager = Network.find(self.network_id).users.exists?(account_manager_id)

      errors.add :error, "sales person, account manager must belong to same network" unless sales_person && account_manager
    end
  end

  def self.of_network(network)
    where(:network => network)
  end

end