class ReportMailer < ActionMailer::Base

  def send_mail(user, file_path)
  	setup_email(user, file_path)
    mail(@headers)
  end

 protected
   def setup_email(user, file_path)
     attach_fname = File.basename(file_path)

     @headers = {
       :to => user.email,
       :subject => "Scheduled Report Results",
       :reply_to => user.network.support_email,
       :from => "support@collective.com"
     }

     raise "File path not found" unless !file_path.nil?

     if File.exist?(file_path)
       attachments[attach_fname] = File.read(file_path)
  
       custom_path = mailer_name 
       custom_name = "#{action_name}"
       @headers[:template_path] = custom_path
       @headers[:template_name] = custom_name
     else
       raise "File not found at path:- #{file_path}"
     end  
   end
    
end
