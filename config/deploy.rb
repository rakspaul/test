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
after 'deploy:restart', 'unicorn:reload' # app IS NOT preloaded
after 'deploy:restart', 'unicorn:restart'  # app preloaded
after 'deploy:finalize_update', 'deploy:file_store_symlink', 'deploy:copy_rabbitmq_config'

task :display_branch, :except => {:no_release => true} do
  puts "\nDEPLOYING #{branch} branch of #{application} to #{stage}\n\n"
end

# require "whenever/capistrano"
# set(:whenever_command) { "RAILS_ENV=#{rails_env} bundle exec whenever" }

# set :whenever_environment, defer { development }
# require "whenever/capistrano"
# set :whenever_command, "bundle exec whenever"

set :test_log, "log/capistrano.test.log"

namespace :deploy do
  before 'deploy:update_code' do
    puts "—> Running tests, please wait …"
    unless system "bundle exec rspec > #{test_log} 2>&1" #' > /dev/null'
      puts "—> Tests failed. Run `cat #{test_log}` to see what went wrong."
      exit
    else      
      puts "—> Tests passed"
      system "rm #{test_log}"
    end
  end

  task :file_store_symlink do
    run "mkdir -p #{shared_path}/file_store && ln -nfs #{shared_path}/file_store #{current_release}/file_store"
  end

  task :copy_rabbitmq_config do
    run "ln -nfs #{shared_path}/rabbitmq.yml #{current_release}/config/rabbitmq.yml"
  end
end
