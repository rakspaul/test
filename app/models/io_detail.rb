class IoDetail < ActiveRecord::Base
  include AASM

  has_paper_trail ignore: [:updated_at]

  belongs_to :reach_client

  belongs_to :media_contact
  belongs_to :billing_contact
  belongs_to :trafficking_contact, class_name: 'User'
  belongs_to :account_manager, class_name: 'User'

  belongs_to :sales_person, foreign_key: :sales_person_id, class_name: 'User'

  belongs_to :order
end
