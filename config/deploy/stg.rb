set :branch, 'stage'

set :rails_env, "stg" # set for capistrano asset pipeline precompilation

set :app1, "stg-ampapp1.collective-media.net"
#set :db1, "stg-ampdb1.collective-media.net"

role :web, app1
role :app, app1
#role :db,  db1, :primary => true

