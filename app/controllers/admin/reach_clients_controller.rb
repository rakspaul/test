class Admin::ReachClientsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Reach Clients") {|instance| instance.send :admin_reach_clients_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_reach_client_path}
  # add_crumb("Edit", only: "edit") {|instance| instance.send :edit_admin_reach_client_path}

  def index
    @reach_clients = ReachClients.includes(:media_contacts, :billing_contacts).of_network(current_network)
  end

  def new

  end

  def show
    @reachClient = ReachClients.of_network_by_id(current_network, params[:id])
    respond_with(@reachClient)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create
    p = params.require(:reachClient).permit(:name, :abbr, :address, :sales_person_id, :account_manager_id, :trafficking_contact_id)
    @reachClient = ReachClients.new(p)
    @reachClient.name = params[:reachClient][:name]
    @reachClient.abbr = params[:reachClient][:abbr]
    @reachClient.address = params[:reachClient][:address]
    @reachClient.network_id = current_network.id
    @reachClient.user_id = current_user.id
    @reachClient.sales_person_id = params[:reachClient][:sales_person_id].to_i
    @reachClient.trafficking_contact_id = params[:reachClient][:trafficking_contact_id].to_i
    @reachClient.account_manager_id = params[:reachClient][:account_manager_id].to_i
    @reachClient.save

    respond_with(@reachClient, location: nil)
  end

  def edit
    @reachClient = ReachClients.of_network_by_id(current_network, params[:id])
    if @reachClient
      add_crumb "Edit - #{@reachClient.name}"
    else
      redirect_to admin_reach_clients_path
    end
  end

  def update
    @reachClient = ReachClients.find(params[:id])

    @reachClient.name = params[:reachClient][:name]
    @reachClient.abbr = params[:reachClient][:abbr]
    @reachClient.address = params[:reachClient][:address]
    @reachClient.sales_person_id = params[:reachClient][:sales_person_id].to_i
    @reachClient.trafficking_contact_id = params[:reachClient][:trafficking_contact_id].to_i
    @reachClient.account_manager_id = params[:reachClient][:account_manager_id].to_i
    @reachClient.media_contact_id = params[:reachClient][:media_contact_id].to_i if params[:reachClient][:media_contact_id].present?
    @reachClient.billing_contact_id = params[:reachClient][:billing_contact_id].to_i if params[:reachClient][:billing_contact_id].present?

    @reachClient.save

    respond_with(@reachClient)
  end
end
