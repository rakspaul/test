class Admin::ReachClientsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :require_client_type_network

  add_crumb("Reach Clients") {|instance| instance.send :admin_reach_clients_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_reach_client_path}

  SORT_COLUMNS = {
                  "name" => "reach_clients.name",
                  "media_contact" => "media_contacts.name",
                  "billing_contact" => "billing_contacts.name",
                  "sales_person" => "users.first_name",
                  "account_manager" => "account_managers_reach_clients.first_name"
                }

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "asc"
    sort_column = SORT_COLUMNS[params[:sort_column]] || "reach_clients.name"

    @reach_clients = ReachClient.includes(includes_params)
                                .of_network(current_network)
                                .references(includes_params)
                                .order("#{sort_column} #{sort_direction}")
                                .page(params[:page]).per(100);
  end

  def new

  end

  def show
    @reach_client = ReachClient.of_network(current_network).where(:id => params[:id]).first
    respond_with(@reach_client)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create
    @reach_client = ReachClient.new(reach_client_params)
    @reach_client.network_id = current_network.id
    @reach_client.user_id = current_user.id
    @reach_client.save

    respond_with(@reach_client, location: nil)
  end

  def edit
    @reach_client = ReachClient.of_network(current_network).where(:id => params[:id]).first
    if @reach_client
      add_crumb "Edit - #{@reach_client.name}"
    else
      redirect_to admin_reach_clients_path
    end
  end

  def update
    @reach_client = ReachClient.find(params[:id])
    @reach_client.update_attributes(reach_client_params)
    @reach_client.save

    respond_with(@reach_client)
  end

  private
    def reach_client_params
      params.require(:reachClient).permit(:name, :abbr, :sales_person_id, :account_manager_id, :media_contact_id, :billing_contact_id, :agency_id, :client_buffer)
    end

    def includes_params
      return :media_contact, :billing_contact, :sales_person, :account_manager
    end
end
