class OrderNotesController < ApplicationController
  include Authenticator

  respond_to :json

  # POST orders/{order_id}/notes
  def create
    order = Order.find(params[:order_id])
    p = params.require(:order_note).permit(:note)
    users_emails = params[:notify_users]

    @note = OrderNote.new(p)
    @note.order = order
    @note.user = current_user
    @note.save

    NotificationsMailer.notification_email(users_emails, @note).deliver if !users_emails.blank?

    respond_with(@note, location: nil)
  end
end
