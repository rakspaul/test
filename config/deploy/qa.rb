set :branch, 'qa'

set :rails_env, "qa" # set for capistrano asset pipeline precompilation

set :hipchat_env, "QA"

set :qa1, "qa-ampapp1.collective-media.net"

role :web, qa1
role :app, qa1

set :default_environment, 'JAVA_HOME' => "/usr/lib/jvm/java-6-sun-1.6.0.26"

