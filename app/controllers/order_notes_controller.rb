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

    notify_users(users_emails) if !users_emails.blank?

    respond_with(@note, location: nil)
  end

private

  def notify_users(users_emails)
    users_emails.each do |user_email|
      u = User.find_by(email: user_email)
      NotificationsMailer.notification_email(u, @note).deliver if u
    end
  end
end
