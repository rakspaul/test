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
    state :saved
    state :reviewing_by_trafficker
    state :reviewing_by_am
    state :rejected
    state :reviewed_by_trafficker
    state :reviewed_by_am
    state :ready_for_push
    state :pushing
    state :failure
    state :active

    event :submit_to_am do
      transitions [:saved, :reviewed_by_trafficker] => [:reviewing_by_am]
    end

    event :submit_to_trafficker do
      transitions [:saved, :reviewed_by_am] => [:reviewing_by_trafficker]
    end

    event :approved_by_account_manager do
      transitions [:reviewed_by_trafficking, :reviewed_by_am] => :ready_for_push
    end

    event :approved_by_trafficking do
      transitions [:reviewed_by_trafficking, :reviewed_by_am] => :ready_for_push
    end

    event :revert_to_draft do
      transitions [:running, :saved] => :draft
    end

    event :push do
      transitions :ready_for_push => :pushing
    end

    event :success do
      transitions :pushing => :active
    end

    event :failure do
      transitions :pushing => :failure
    end
  end
end
