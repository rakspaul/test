Reachui::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Stores cached data
  config.cache_store = :dalli_store

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  config.scala_api = 'http://dev-desk.collective-media.net:9000'
  config.nodejs_api = 'http://dev-desk.collective-media.net:5000'

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  config.assets.paths << Rails.root.join('app', 'assets', 'fonts')
  ## Custom application configurations

  # audience group segment search
  # comma separated string of network ids
  config.search_segments_in_network = '6,176'

  # audience group context search
  # network to search for context
  config.search_contexts_in_network = '6'

  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_deliveries = true
  config.action_mailer.default :charset => "utf-8"
  config.action_mailer.delivery_method = :test

  config.action_mailer.default_url_options = {
    host: "http://localhost:3000"
  }

  config.backbone_service_url = "http://127.0.0.1:9091/"
end
