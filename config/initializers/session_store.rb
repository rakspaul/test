# Be sure to restart your server when you modify this file.

Reachui::Application.config.session_store :cookie_store, key: '_reachui_session', domain: :all, tld_length: 3

cookie_config = YAML.load_file(File.join(Rails.root, 'config', 'cookie.yml')).deep_symbolize_keys

Reachui::Application.config.secret_key_base = cookie_config[:secret_key_base]
Reachui::Application.config.session_store(:cookie_store,
                                          :key   => cookie_config[:key],
                                          :domain => cookie_config[Rails.env.to_sym][:domain])
