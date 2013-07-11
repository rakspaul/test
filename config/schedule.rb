# Use this file to easily define all of your cron jobs.
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron
# Learn more: http://github.com/javan/whenever

set :output, "log/cron_log.log"

every 1.day, :at => '11:30 pm' do
  rake "schedule_report:get_reports_from_amp", :environment => "development"
  rake "schedule_report:get_reports_data", :environment => "development"
  rake "schedule_report:parse_and_export", :environment => "development"
  rake "schedule_report:email_to_user", :environment => "development"
end
