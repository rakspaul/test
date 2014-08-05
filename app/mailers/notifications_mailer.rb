class NotificationsMailer < ActionMailer::Base
  def notification_email(emails, note)
    @note  = note
    mail(to: emails, from: @note.user.email, subject: "#{@note.order.io_detail.try(:state_desc)} | ##{@note.order.name} | #{@note.order.start_date.to_date} - #{@note.order.end_date.to_date}")
  end
end
