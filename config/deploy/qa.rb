set :branch, 'qa'

set :rails_env, "qa" # set for capistrano asset pipeline precompilation

set :qa1, "qa-ampapp1.collective-media.net"

role :web, qa1
role :app, qa1
role :db,  qa1, :primary => true
