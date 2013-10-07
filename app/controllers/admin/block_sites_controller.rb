class Admin::BlockSitesController < ApplicationController
  include Authenticator

  layout "admin"

  add_crumb("Block Sites") {|instance| instance.send :admin_block_sites_path}

  def index
  end
end
