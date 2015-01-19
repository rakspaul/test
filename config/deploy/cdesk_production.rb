set :branch, 'cdesk_master'

set :rails_env, "cdesk_production" # set for capistrano asset pipeline precompilation

set :hipchat_env, "cdesk_production"

set :app1, "ampapp2.collective-media.net"
set :app2, "ampapp3.collective-media.net"

role :web, app1,app2
role :app, app1,app2

