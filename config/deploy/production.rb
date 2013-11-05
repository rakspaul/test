set :branch, 'master'

set :rails_env, "production" # set for capistrano asset pipeline precompilation

set :hipchat_env, "Production"

set :app1, "ampapp1.collective-media.net"

role :web, app1
role :app, app1

set :default_environment, 'JAVA_HOME' => "/usr/lib/jvm/java-6-sun-1.6.0.26"
#set :default_environment, 'JAVA_HOME' => '`readlink -f /usr/bin/java | sed "s:bin/java::"`'

