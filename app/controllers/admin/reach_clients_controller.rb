class Admin::ReachClientsController < ApplicationController
  include Authenticator

  layout "admin"

  add_crumb("Reach Clients") {|instance| instance.send :admin_reach_clients_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_reach_client_path}
  add_crumb("Edit", only: "edit") {|instance| instance.send :edit_admin_reach_client_path}

  def index
    @reach_clients = ReachClients.all()
  end

  def new

  end

  def create

  end

  def edit

  end

  def udpate

  end
end
