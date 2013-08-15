class IoDetail < ActiveRecord::Base
  attr_accessor :overall_status, :trafficking_status, :account_manager_status

  has_paper_trail ignore: [:updated_at]

  belongs_to :reach_client
  belongs_to :media_contact
  belongs_to :billing_contact
  belongs_to :trafficking_contact, class_name: 'User'
  belongs_to :account_manager, class_name: 'User'
  belongs_to :sales_person, foreign_key: :sales_person_id, class_name: 'User'
  belongs_to :order

  state_machine :trafficking_status, initial: :unreviewed, namespace: "trafficking" do
    state :unreviewed
    state :reviewing
    state :rejected
    state :reviewed

    event :review do
      transition [:unreviewed, :rejected] => :reviewing
    end

    event :reject do
      transition :reviewing => :rejected
    end

    event :reviewed do
      transition :reviewing => :reviewed
    end
  end

  state_machine :account_manager_status, initial: :unreviewed, namespace: "account_manager" do
    state :unreviewed
    state :reviewing
    state :rejected
    state :reviewed

    event :review do
      transition [:unreviewed, :rejected] => :reviewing
    end

    event :reject do
      transition :reviewing => :rejected
    end

    event :reviewed do
      transition :reviewing => :reviewed
    end
  end

  state_machine :overall_status, initial: :draft do
    state :draft
    state :reviewing
    state :rejected
    state :ready_for_push
    state :pushing
    state :failure
    state :active

    event :approved_by_account_manager do
      transition [:reviewed_by_trafficking, :reviewed_by_account_manager] => :ready_for_push
    end

    event :approved_by_trafficking do
      transition [:reviewed_by_trafficking, :reviewed_by_account_manager] => :ready_for_push
    end

    event :revert_to_draft do
      transition :running => :draft
    end

    event :push do
      transition :ready_for_push => :pushing
    end

    event :success do
      transition :pushing => :active
    end

    event :failure do
      transition :pushing => :failure
    end
  end

  # state_machine's related
  def initialize(*args)
    super(*args)
  end
end
