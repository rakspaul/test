Reachui::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = false

  # Stores cached data
  # config.cache_store = :dalli_store

  # Configure static asset server for tests with Cache-Control for performance.
  config.serve_static_assets  = true
  config.static_cache_control = "public, max-age=3600"

  # Generate digests for assets URLs.
  config.assets.digest = true

  # Add additional assets.
  config.assets.paths << Rails.root.join('app', 'assets', 'fonts')
  config.assets.paths << Rails.root.join('app', 'assets', 'views')
  config.assets.paths << Rails.root.join('app', 'assets', 'images', 'cdesk')

  # Precompile additional assets.
  # application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
  config.assets.precompile += %w(cdesk_application.js cdesk_application.css)

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = true
  config.action_dispatch.show_detailed_exceptions = true

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  ## Custom application configurations

  # Set the reporting server url
  config.report_service_uri = 'http://cm.stgcdb.collective-media.net/export'

  # audience group segment search
  # comma separated string of network ids
  config.search_segments_in_network = '6,176'

  config.scala_api = 'https://demo-desk.collective.com/dataapi'

  # audience group context search
  # network to search for context
  config.search_contexts_in_network = '6'

  config.action_mailer.default_url_options = {
    host: "http://qa-desk.collective.com"
  }

  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.perform_deliveries = true
  config.action_mailer.default :charset => "utf-8"
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    :enable_starttls_auto => true,
    :address => "west.exch023.serverdata.net",
    :port => "587",
    :domain => "collective.com",
    :authentication => :login,
    :user_name => "support@collective.com",
    :password => "T4idav2wo5mP"
  }

  config.backbone_service_url = "http://127.0.0.1:9091/"
end
