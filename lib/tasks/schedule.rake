require 'open-uri'

namespace :schedule_report do
 task :everyday_report => :environment do

   scheduled_rep = ReportSchedule.where(frequency_type: 'Everyday', status: 'Scheduled')
   
   @timezone = 'Eastern Time (US & Canada)'
   @time_now = DateTime.now.utc.in_time_zone(@timezone)

   scheduled_rep.each do |report|
     @network_id = User.find(report.user_id).network.id
     @user_id = report.user_id

     if report.report_end_date >= @time_now && report.report_start_date <= @time_now
       @url = modify_url(report.url)

       resp = report_service_call(@url)

       send_email
     end
   end  	
 
 end

 def modify_url(url)
   uri = URI.parse(url)
   url =~ /tkn=/ ? url.sub!(/tkn=(\w+)/,"tkn=#{build_request_token}") : url += "&tkn=#{build_request_token}"
   url.gsub!(/end_date(=|:)[0-9-]+/,'end_date\1'+@time_now.strftime('%Y-%m-%d').gsub(/-0/,'-'))
   
   url
 end

 def report_service_call(url)
   response = nil
     open(url, :read_timeout => 3600) do |file|
       response = file.read
     end
   
   response
 end

 def build_request_token
   Digest::MD5.hexdigest("#{@network_id}:#{@user_id}:#{Date.today.strftime('%Y-%m-%d')}")
 end

 def send_email
 end

 task :weekly_report => :environment do
 end 

 task :monthly_report => :environment do
 end 

 task :quarterly_report => :environment do
 end  

end  
