class OrderNotesController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    if params[:order_id]
      @notes = OrderNote.for_order(params[:order_id]).order('created_at desc')
      respond_with(@notes)
    end
  end

  # POST orders/{order_id}/notes
  def create
    order = Order.find(params[:order_id])
    p = params.require(:order_note).permit(:note)
    users_emails = params[:notify_users]

    @note = OrderNote.new(p)
    @note.order = order
    @note.user = current_user
    @note.save

    notify_users(users_emails) if !users_emails.blank?

    respond_with(@note, location: nil)
  end

private

  def notify_users(users_emails)
    users_emails.each do |user_email|
      NotificationsMailer.notification_email(user_email.strip, @note).deliver
    end
  end
end
