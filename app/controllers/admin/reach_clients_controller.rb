class Admin::ReachClientsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :require_client_type_network

  add_crumb("Reach Clients") {|instance| instance.send :admin_reach_clients_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_reach_client_path}

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "asc"
    sort_column = params[:sort_column] ? params[:sort_column] : "name"

    if sort_column == "media_contact"
      sort_column = "media_contacts.name"
    elsif sort_column == "billing_contact"
      sort_column = "billing_contacts.name"
    elsif sort_column == "sales_person"
      sort_column = "users.first_name"
    elsif sort_column == "account_manager"
      sort_column = "account_managers_reach_clients.first_name"
    end

    reach_clients = ReachClient.includes(:media_contact, :billing_contact).joins(:sales_person, :account_manager,).of_network(current_network).order(sort_column + " " + sort_direction)
    @reach_clients = Kaminari.paginate_array(reach_clients).page(params[:page]).per(50);
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
    p = params.require(:reachClient).permit(:name, :abbr, :sales_person_id, :account_manager_id, :agency_id, :client_buffer)
    @reach_client = ReachClient.new(p)
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
    p = params.require(:reachClient).permit(:name, :abbr, :sales_person_id, :account_manager_id, :media_contact_id, :billing_contact_id, :agency_id, :client_buffer)
    @reach_client.update_attributes(p)
    @reach_client.save

    respond_with(@reach_client)
  end
end
