# Use this file to easily define all of your cron jobs.
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron
# Learn more: http://github.com/javan/whenever

set :output, "log/cron_log.log"

every 1.day, :at => '11:30 pm' do
  rake "schedule_report:everyday_report", :environment =>"development"	
  
  rake "schedule_report:weekly_report", :environment => "development"
  
  rake "schedule_report:monthly_report", :environment => "development"
  
  rake "schedule_report:quarterly_report", :environment => "development"
end
