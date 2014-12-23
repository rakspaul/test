set :branch, 'cdesk_p1'

set :rails_env, "newstg" # set for capistrano asset pipeline precompilation

set :hipchat_env, "Stage"

set :app1, "104.131.251.80"

role :web, app1
role :app, app1



set :default_environment, 'JAVA_HOME' => '/usr/lib/jvm/java-6-sun-1.6.0.26', 'DEPLOY_ENV' => 'cdesk'
