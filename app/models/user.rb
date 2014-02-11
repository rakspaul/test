class User < ActiveRecord::Base
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
end

