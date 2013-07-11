namespace :schedule_report do

 task :get_reports_from_amp => :environment do
   # Fetch report data from AMP db "	
   @report_schedule = []	
   @timezone = 'Eastern Time (US & Canada)'
   time_now = DateTime.now.utc.in_time_zone(@timezone).to_formatted_s(:db)

   @report_schedule << ReportSchedule.where('run_from BETWEEN ? AND ?', DateTime.now.beginning_of_day.to_formatted_s(:db), DateTime.now.end_of_day.to_formatted_s(:db)).all
   puts "LIST OF REPORTS TO BE GENERATED   #{@report_schedule}"
 end

 task :get_reports_data => :environment do
   # Load data from reporting server "	
 end

 task :parse_and_export => :environment do
   # Parse and export data to xls/csv "	
 end

 task :email_to_user => :environment do
   # Email to user "	
 end

end  
