class Admin::BlockedAdvertisersController < ApplicationController
  include Authenticator

  layout "admin"

  add_crumb("Blocked Advertisers") {|instance| instance.send :admin_blocked_advertisers_path}

  def index
  end
end
