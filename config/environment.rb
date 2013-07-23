# Load the rails application.
require File.expand_path('../application', __FILE__)

# Initialize the rails application.
Reachui::Application.initialize!

$logger = Logger.new("#{Rails.root}/log/schedule_job.log")
$logger.datetime_format = "%Y-%m-%d %H:%M:%S"
