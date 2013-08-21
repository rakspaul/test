class ReachClient < ActiveRecord::Base
  belongs_to :trafficking_contact, class_name: User
  belongs_to :sales_person, class_name: SalesPeople
  belongs_to :account_manager, class_name: User

  has_one :media_contact
  has_one :billing_contact

  has_many :io_details

  validates_presence_of :name, :abbr, :address, :network_id
end
