class IoDetail < ActiveRecord::Base

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

private

  def enqueue_for_push
    require 'bunny'
   
    conn = Bunny.new(:host => '127.0.0.1')
    conn.start

    ch   = conn.create_channel
    q    = ch.queue("reach.io.push", :durable => true)
    Rails.logger.warn "Sending...#{q.name}, order id: #{self.order.id}"
    msg  = self.order.id.to_s

    q.publish(msg, :persistent => true)
    Rails.logger.warn " [reach.io.push] Sent #{msg}"

    conn.close
  rescue => e
    Rails.logger.warn e.message.inspect
    self.failure!
  end
end
