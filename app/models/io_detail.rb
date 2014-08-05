class IoDetail < ActiveRecord::Base
  STATUS = {
    failure: "Failure",
    pushing: "Pushing",
    pushed: "Pushed",
    incomplete_push: "Incomplete Push",
    draft: "Draft",
    ready_for_am: "Ready for AM",
    ready_for_trafficker: "Ready for Trafficker",
    delivering: "Delivering",
    completed: "Completed",
    revisions_proposed: "Revisions Proposed",
    revisions_resolved: "Revisions Resolved",
    revisions_unresolved: "Revisions Unresolved",
    proposed: "Proposed"
  }

  has_paper_trail ignore: [:updated_at]

  belongs_to :reach_client
  belongs_to :media_contact
  belongs_to :billing_contact
  belongs_to :trafficking_contact, class_name: 'User'
  belongs_to :account_manager, class_name: 'User'
  belongs_to :sales_person, foreign_key: :sales_person_id, class_name: 'User'
  belongs_to :order

  validates :reach_client_id, presence: true

  after_commit :enqueue_for_push, on: [:update, :create], if: lambda {|order| order.state=~ /pushing/i }

  def state_key
    self.state.downcase.to_sym
  end

  def state_desc
    STATUS[state_key]
  end
private

  def enqueue_for_push
    queue_name = "reach.io.push"
    rmq = RabbitMQWrapper.new :queue => queue_name

    Rails.logger.warn "Sending...#{queue_name}, order id: #{self.order.id}"
    msg  = self.order.id.to_s

    rmq.publish(msg)
    rmq.close
  rescue => e
    Rails.logger.warn e.message.inspect
    self.update_attribute :state, 'failure'
  end
end
