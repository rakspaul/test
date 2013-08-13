class User < ActiveRecord::Base
  SALES_ROLE = 'Sales'

  has_one :account

  belongs_to :network, :foreign_key => 'company_id'

  has_and_belongs_to_many :roles

  has_one :reach_client

  scope :sales_people, -> { includes(:roles).where(['roles.name = ?', SALES_ROLE]) }

  def admin?
    authority.downcase == 'admin'
  end

  def super_admin?
    authority.downcase == 'superadmin'
  end
end

