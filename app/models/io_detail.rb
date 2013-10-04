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


  aasm :column => 'state' do
    state :draft, :initial => true
    state :ready_for_trafficker
    state :ready_for_am

    state :pushing
    state :failure
    state :pushed

    event :submit_to_am do
      transitions from: [:draft, :ready_for_trafficker, :failure, :pushed, :ready_for_am], to: :ready_for_am
    end

    event :submit_to_trafficker do
      transitions from: [:draft, :ready_for_trafficker, :failure, :pushed, :ready_for_am], to: :ready_for_trafficker
    end

    event :revert_to_draft do
      transitions from: [:ready_for_trafficker, :failure, :pushed, :ready_for_am], to: :draft
    end

    event :push do
      transitions from: [:draft, :ready_for_trafficker, :failure, :pushed, :ready_for_am], to: :pushing
    end

    event :success do
      transitions from: :pushing, to: :pushed
    end

    event :failure do
      transitions from: :pushing, to: :failure
    end
  end
end
