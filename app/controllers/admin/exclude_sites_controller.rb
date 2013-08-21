class Admin::ExcludeSitesController < ApplicationController
  include Authenticator

  layout "admin"

  add_crumb("Exclude Sites") {|instance| instance.send :admin_exclude_sites_path}

  def index
  end
end
