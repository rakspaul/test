class NotificationsMailer < ActionMailer::Base
  def notification_email(email, note)
    @note  = note
    mail(to: email, from: @note.user.email, subject: "#{IoDetail::STATUS[@note.order.io_detail.try(:state).try(:to_sym)]} | ##{@note.order.name} | #{@note.order.start_date.to_date} - #{@note.order.end_date.to_date}")
  end
end
