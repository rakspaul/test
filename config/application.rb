require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Reachui
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'Eastern Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
    # config.action_dispatch.default_headers = { 'Header-Name' => 'Header-Value', 'X-Frame-Options' => 'ALLOW-FROM http://172.27.165.55:3004' }
    config.i18n.enforce_available_locales = false

    # Rails 4 by defaults adds X-Frame-Options response header with a value "SAMEORIGIN",
    # because of this application will not load if the parent application and child application are from different domains.
    # http://stackoverflow.com/questions/16573411/fix-rails-oauth-facebook-x-frame-options-sameorigin-error
    config.action_dispatch.default_headers.clear()

    config.autoload_paths += %W(#{config.root}/app/models/lineitems)
    config.autoload_paths += %W(#{config.root}/app/models/geo_target)

    config.compass.css_dir = "public/stylesheets"
  end
end
