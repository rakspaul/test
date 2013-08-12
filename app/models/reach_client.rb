class ReachClient < ActiveRecord::Base
  has_many :io_details

  has_one :media_contact
  has_one :billing_contact

  belongs_to :trafficking_contact, class_name: User
  belongs_to :sales_person, class_name: SalesPeople
  belongs_to :account_manager, class_name: User
end
