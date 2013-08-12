class User < ActiveRecord::Base
  has_one :account

  belongs_to :network, :foreign_key => 'company_id'

  has_one :reach_client

  def admin?
    authority.downcase == 'admin'
  end

  def super_admin?
    authority.downcase == 'superadmin'
  end
end

