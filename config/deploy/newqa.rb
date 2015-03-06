set :branch, 'sprint-#{ENV['SPRINT']}'

set :rails_env, "newqa" # set for capistrano asset pipeline precompilation

set :hipchat_env, "QA"

set :qa1, "qaweb-cdesk001.private.collective.com"

role :web, qa1
role :app, qa1



set :default_environment, 'JAVA_HOME' => "/usr/lib/jvm/java-6-sun-1.6.0.26"
