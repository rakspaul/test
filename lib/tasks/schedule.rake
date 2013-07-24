require 'net/http'

namespace :schedule_report do
 
 task :schedule_task => :environment do

   $logger.info("Report running execution begin...")
   scheduled_rep = ReportSchedule.where("status = 'Scheduled' AND frequency_type IS NOT NULL")

   $logger.info("Load scheduled reports.")
   @time_now = get_time_utc

   begin
     scheduled_rep.each do |report|
       @user = User.find(report.user_id)
       scheduled_start_date = report.report_start_date.strftime("%Y-%m-%d")
       scheduled_end_date = report.report_end_date.strftime("%Y-%m-%d")

       if scheduled_end_date >= @time_now.strftime("%Y-%m-%d") && scheduled_start_date <= @time_now.strftime("%Y-%m-%d")
	      $logger.info("Processing report id #{report.id}")

	      case report.frequency_type
	    
	      when "Everyday"
	        run(report)	

	      when "Weekly"
	    	  if report.frequency_value.include?(@time_now.strftime("%A"))
	    	    run(report)
	    	  end  	

	      when "Specific day"
	    	  values = report.frequency_value.to_date.strftime("%Y-%m-%d")
           if values.include?(@time_now.strftime("%Y-%m-%d"))
             run(report)
           end  	

         when "Quarterly"
           quarters = [[1,2,3], [4,5,6], [7,8,9], [10,11,12]]
           current_quarter = quarters[(@time_now.month - 1) / 3]
           q_num = quarters.index(current_quarter) + 1

           current_year = @time_now.year
           q_dates = ["#{current_year}-03-31", "#{current_year}-06-30", "#{current_year}-09-30", "#{current_year}-12-31", "2013-07-24"]
         
           if report.frequency_value.include?(q_num.to_s) && q_dates.include?(@time_now.strftime("%Y-%m-%d"))
             run(report)
           end
       
         else
           $logger.warn("No reports to be executed on date #{@time_now.strftime("%Y-%m-%d")}")	
         end    	
       
         $logger.info("Report running execution end")
       end  
     end
   rescue Exception => e
     $logger.error(e.message)	
   end  

 end

 def run(report)
   @url = modify_url(report.url)
   resp = report_service_call(@url)

   if !resp.nil?
     begin
       file_path = write_file(resp.body, report)
       ReportMailer.send_mail(@user, file_path).deliver
       $logger.info("Send email to #{@user.first_name}-#{@user.last_name}")
       File.delete(file_path)

     rescue => e
     	 $logger.error(e.message)
     end 

     if report.report_end_date.strftime("%Y-%m-%d") == @time_now.strftime("%Y-%m-%d")
       $logger.info("Updating report status")	
       ActiveRecord::Base.connection.execute("UPDATE reach_schedule_reports SET status ='Completed' WHERE id = #{report.id};")
       ActiveRecord::Base.connection.execute("UPDATE reach_schedule_reports SET last_ran = #{@time_now} WHERE id = #{report.id};") 
     end 
   else
     $logger.error("Report data missing of ID:- #{report.id}")
     ActiveRecord::Base.connection.execute("UPDATE reach_schedule_reports SET status ='Failure' WHERE id = #{report.id};")
   end
 end	

 def modify_url(url)
   url =~ /tkn=/ ? url.sub!(/tkn=(\w+)/,"tkn=#{build_request_token}") : url += "&tkn=#{build_request_token}"
   url.gsub!(/end_date(=|:)[0-9-]+/,'end_date\1'+@time_now.strftime('%Y-%m-%d').gsub(/-0/,'-'))
  
   url
 end

 def report_service_call(url)
  begin
  	 $logger.info("Fetching data from reporting server")
    uri = URI.parse(@url)
    http_conn = Net::HTTP.new(uri.host, uri.port)
    http_conn.use_ssl = uri.is_a? URI::HTTPS
    response = nil
    http_conn.start {|http| response = http.post("#{uri.path}", "#{uri.query}")}
  rescue => e
  	 $logger.error(e.message)
  end
    
   response  
 end

 def build_request_token
   Digest::MD5.hexdigest("#{@user.network.id}:#{@user.id}:#{Date.today.strftime('%Y-%m-%d')}")
 end

 def write_file(resp, report)
   file_name = "Report_#{@user.id}_#{report.start_date.strftime("%Y-%m-%d")}_to_#{@time_now.strftime("%Y-%m-%d")}.csv"
   file_path = "tmp/reports/#{file_name}"

   File.open(file_path,'w') do |file|
     file.puts resp
     file.close
   end
   
   file_path
 end

 def get_time_utc
   timezone = Rails.application.config.time_zone
   time_now = DateTime.now.utc.in_time_zone(@timezone)
   
   time_now 
 end

end  
