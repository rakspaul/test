class User < ActiveRecord::Base
  CLIENT_TYPE_AGENCY = "Agency"
  CLIENT_TYPE_NETWORK = "Network"

  belongs_to :network, :foreign_key => 'company_id'
  belongs_to :agency

  has_one :account
  has_one :reach_client

  has_and_belongs_to_many :roles

  def self.of_network(network)
    where(:network => network)
  end

  def admin?
    authority.downcase == 'admin'
  end

  def super_admin?
    authority.downcase == 'superadmin'
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def network_user?
    is_client_type(User::CLIENT_TYPE_NETWORK)
  end

  def agency_user?
    is_client_type(User::CLIENT_TYPE_AGENCY)
  end

  def has_roles?(role_names)
    roles.where(roles: {name: role_names.split(",")}).size == role_names.size
  end

  def is_client_type(type)
    client_type == type
  end
end

