begin
  require "rvm/capistrano" # Load RVM's capistrano plugin.
rescue LoadError
  unless @retried
    puts "failed to load rvm_capistrano, will check bundle and retry"
    @retried = true
    retry if system("bundle install")
  end
end

require 'capistrano/ext/multistage'
require 'bundler/capistrano'
require 'hipchat/capistrano'

set :application, "reachui"
set :repository,  "git@github.com:collectivereach/reachui.git"
set :scm, :git
set :use_sudo, false
set :keep_releases, 7 # keep the last N releases
set :deploy_via, :remote_cache
set :git_enable_submodules, true
set :branch, :master

set :stages, %w(stg qa production)
set :default_stage, "qa"

set :reachui_user,  "amp"
set :reachui_group, "amp"
set :user, reachui_user

set :deploy_to, "/home/#{reachui_user}/#{application}"

set :rvm_ruby_string, "ruby-2.0.0-p195@reachui"
set :rvm_user, :amp
set :rvm_type, :user # we're doing user based rvm install (vs system wide)
set :rvm_install_type, :stable # vs :head

set :bundle_flags, "" #   "--quiet"
set :bundle_without,  [:deploy, :development, :test]
#set :required_bundler_version, "1.3.5"

set :hipchat_token, "40ff730a12295ac7dba7a961809cda"
set :hipchat_room_name, "Syn: ROM P1"
set :hipchat_announce, false # notify users
set :hipchat_color, 'green' #finished deployment message color
set :hipchat_failed_color, 'red' #cancelled deployment message color

ssh_options[:forward_agent] = true
default_run_options[:pty] = true

before 'deploy:setup', "rvm:install_rvm", "rvm:install_ruby"
before "deploy", "display_branch"

# Unicorn tasks
set(:unicorn_env) { rails_env }
set(:app_env)     { rails_env }

require 'capistrano-unicorn'

before 'deploy:update_code', 'run_tests'

after 'deploy:restart', 'unicorn:reload' # app IS NOT preloaded
after 'deploy:restart', 'unicorn:restart'  # app preloaded
after 'deploy:finalize_update', 'deploy:file_store_symlink', 'deploy:copy_rabbitmq_config'

task :display_branch, :except => {:no_release => true} do
  puts "\nDEPLOYING #{branch} branch of #{application} to #{stage}\n\n"
end

set :test_log, "log/capistrano.test.log"

task :run_tests do
  puts "--> Running tests"
  client = HipChat::Client.new(hipchat_token)
  if tests_output = system("bundle exec rspec > #{test_log}")
    puts "----> Tests successfully passed"
    client[hipchat_room_name].send('Deploy', 'Tests successfully passed', :color => hipchat_color)
    system("rm #{test_log}")
  else
    puts "----> Tests failed: "
    puts tests_output
    client[hipchat_room_name].send('Deploy', 'Tests failed', :color => hipchat_failed_color)
    exit
  end
end

# require "whenever/capistrano"
# set(:whenever_command) { "RAILS_ENV=#{rails_env} bundle exec whenever" }

# set :whenever_environment, defer { development }
# require "whenever/capistrano"
# set :whenever_command, "bundle exec whenever"

namespace :deploy do
  task :file_store_symlink do
    run "mkdir -p #{shared_path}/file_store && ln -nfs #{shared_path}/file_store #{current_release}/file_store"
  end

  task :copy_rabbitmq_config do
    run "ln -nfs #{shared_path}/rabbitmq.yml #{current_release}/config/rabbitmq.yml"
  end
end
