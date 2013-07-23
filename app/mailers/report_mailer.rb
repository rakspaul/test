class ReportMailer < ActionMailer::Base

  def send_mail(user, rpt, file_path)
  	setup_email(user, rpt, file_path)
    mail(@headers)
  end

 protected
   def setup_email(user, rpt, file_path)
     duration = "#{rpt.start_date.strftime("%Y-%m-%d")}_to_#{Date.today.to_s}"

     @headers = {
       :to => user.email,
       :subject => "Report (#{duration})",
       :reply_to => user.network.support_email,
       :from => "support@collective.com"
     }

     if File.exist?(file_path)
       attachments["Report_#{user.id}_#{duration}.csv"] = File.read(file_path)
  
       custom_path = mailer_name 
       custom_name = "#{action_name}"
       @headers[:template_path] = custom_path
       @headers[:template_name] = custom_name
     else
       raise "File not found at #{file_path}"
     end  
   end
    
end
