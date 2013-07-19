require 'net/http'

namespace :schedule_report do
 task :everyday_report => :environment do

   $log = Logger.new(STDOUT)
   scheduled_rep = ReportSchedule.where(frequency_type: 'Everyday', status: 'Scheduled')
   
   @time_now = get_time_utc

   scheduled_rep.each do |report|
     @user = User.find(report.user_id)

     if report.report_end_date >= @time_now && report.report_start_date <= @time_now
       @url = modify_url(report.url)

       resp = report_service_call(@url)

       if resp.body.length > 0
         file_path = write_file(resp.body, report)   
         ReportMailer.send_mail(@user, report, file_path).deliver
         File.delete(file_path)
       else
         $log.info "No such data in a report"
       end
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
  begin
    uri = URI.parse(@url)
    puts uri
    http_conn = Net::HTTP.new(uri.host, uri.port)
    http_conn.use_ssl = uri.is_a? URI::HTTPS
    response = nil
    http_conn.start {|http| response = http.post("#{uri.path}", "#{uri.query}")}
  rescue => e
    e.message
  end 
    
   response  
 end

 def build_request_token
   Digest::MD5.hexdigest("#{@user.network.id}:#{@user.id}:#{Date.today.strftime('%Y-%m-%d')}")
 end

 def write_file(resp, report)
   file_name = "Report_#{@user_id}_(#{report.start_date.strftime("%Y-%m-%d")}_to_#{@time_now.strftime("%Y-%m-%d")}).csv"
   file_path = "tmp/reports/#{file_name}" 

   File.open(file_path,'w') do |file|
     file.puts resp
   end

   return file_path
 end

 def get_time_utc
   timezone = Rails.application.config.time_zone
   time_now = DateTime.now.utc.in_time_zone(@timezone)
   
   time_now 
 end

 task :weekly_report => :environment do
   scheduled_rep = ReportSchedule.where(frequency_type: 'Weekly', status: 'Scheduled')

   scheduled_rep.each do |report|
     @user = User.find(report.user_id)

     @time_now = Date.parse(get_time_utc.strftime("%Y-%m-%d"))
     last_ran = Date.parse(report.last_ran.strftime("%Y-%m-%d"))
     no_of_days = (@time_now - last_ran).to_i

     if no_of_days == 8
       @url = modify_url(report.url)
       resp = report_service_call(@url)

       file_path = write_file(resp.body, report)   
       ReportMailer.send_mail(@user, report, file_path).deliver
       File.delete(file_path)
     end 
   end   
 end 

 task :monthly_report => :environment do
 end 

 task :quarterly_report => :environment do
 end  

end  
