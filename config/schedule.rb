# Use this file to easily define all of your cron jobs.
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron
# Learn more: http://github.com/javan/whenever

set :output, "log/cron_log.log"

#set :environment, ENV['RAILS_ENV']

every 1.day, :at => '10:00pm' do
  rake "schedule_report:schedule_task", :environment =>"development"
end
