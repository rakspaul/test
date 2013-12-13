class NotificationsMailer < ActionMailer::Base
  default from: "from@example.com"

  def notification_email(user, note)
    @user = user
    @note  = note
    mail(to: @user.email, subject: "New note added to the order ##{@note.order_id} from the user #{@note.user.full_name}")
  end
end
