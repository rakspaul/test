set :branch, 'cdesk_sprint11'

set :rails_env, "cdesk_production" # set for capistrano asset pipeline precompilation

set :hipchat_env, "cdesk_production"

set :app1, "ampapp2.collective-media.net"

role :web, app1
role :app, app1

