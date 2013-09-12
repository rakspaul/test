set :branch, 'stage'

set :rails_env, "stg" # set for capistrano asset pipeline precompilation

set :app1, "stg-ampapp1.collective-media.net"

role :web, app1
role :app, app1

set :default_environment, 'JAVA_HOME' => "/usr/lib/jvm/java-6-sun-1.6.0.26"
#set :default_environment, 'JAVA_HOME' => '`readlink -f /usr/bin/java | sed "s:bin/java::"`'

after "deploy:cleanup", "config:nginx"

namespace :config do
  desc %[Ensures nginx config is wired up]
  task :nginx, :roles => :web do
    run %Q(
      if [ "$(readlink /etc/nginx/sites-available/reach)" != "/home/amp/amp-web/current/config/nginx.stg.config" ]; then \
        [ -e /etc/nginx/sites-available/reach ] && sudo rm /etc/nginx/sites-available/reach ;
        sudo ln -s /home/amp/reach/current/config/nginx.stg.config /etc/nginx/sites-available/reach;
      fi ; \
      if [ "$(readlink /etc/nginx/sites-enabled/reach)" != "/etc/nginx/sites-available/reach" ]; then \
        [ -e /etc/nginx/sites-enabled/reach ] && sudo rm /etc/nginx/sites-enabled/reach ;
        sudo ln -s /etc/nginx/sites-available/reach /etc/nginx/sites-enabled/reach && sudo /etc/init.d/nginx reload;
      fi
    )
  end
end

