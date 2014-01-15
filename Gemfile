source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.0.1'

# Use Postgresql as the database for Active Record
gem 'pg'

# HAML template engine
gem 'haml-rails', '~> 0.4'

# Authentication for legacy logins
gem 'authlogic', '~> 3.3.0'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0'
gem 'compass-rails', '~> 1.1.3' #'~> 2.0.alpha.0'

# Twitter bootstrap
gem 'bootstrap-sass-rails'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.5.0'

# decorator for presentation logic
gem 'draper', '~> 1.2.1'

# breadcrumbs
gem 'crummy', '~> 1.7.2'

# Pre-compiling javascript templates
#gem 'ruby-haml-js', git: 'https://github.com/dnagir/ruby-haml-js.git'
gem 'ejs'

# read Excel files
gem 'roo', '~> 1.11.2'

# gem for https://github.com/blueimp/jQuery-File-Upload
gem 'jquery-fileupload-rails', '~> 0.4.1'

# For audit logs
gem 'paper_trail', :git => 'https://github.com/airblade/paper_trail.git', :branch => 'rails4'

# State machine
gem 'aasm'

# Easy to use, feature complete Ruby client for RabbitMQ 2.0 and later versions.
gem 'bunny'

group :development, :test do
  gem 'rspec-rails', '~> 2.13.2'
  gem 'shoulda', '~> 3.5.0'
  gem 'factory_girl_rails', '~> 4.2.1'
  gem 'debugger', '~> 1.6.0'

  gem 'guard-rspec'
  gem 'jasmine-rails'
  gem 'jasmine-jquery-rails'
  gem 'sinon-rails'
  gem 'guard-jasmine'

  gem 'simplecov'
end

group :development do
  gem 'better_errors', '~> 0.9.0'
  gem 'binding_of_caller', '~> 0.7.1'
  gem 'awesome_print', '~> 1.1.0'
  gem 'quiet_assets', '~> 1.0.2'
  gem 'capistrano-unicorn', '~> 0.1.9', :require => false
end

group :test do
  gem 'shoulda-matchers', '~> 2.1.0'
  gem 'faker', '~> 1.2.0'
  gem 'capybara', '~> 2.1.0'
  gem 'poltergeist', '~> 1.3.0'
end

# Non-production gems
# intentionally naming this deploy vs dev/development so that rails doesn't try to load them in development mode
group :deploy do
  gem 'rvm-capistrano', '~> 1.3.0'
  gem 'capistrano', '~> 2.15.4'
  gem 'capistrano-ext', '~> 1.2'
  gem 'hipchat', '~> 0.12.0'
end

# Use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the app server
gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# For cache storage
gem 'dalli'

# For json parsing
gem 'json', '~> 1.8.0'

gem 'whenever', :require => false

# For exporting xlsx file with order info
gem "rjb"

gem 'spreadsheet'

gem 'kaminari'
