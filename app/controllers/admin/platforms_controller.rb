class Admin::PlatformsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :platform_params, :only => [:create, :update]
  before_filter :set_current_network

  add_crumb("Platforms") {|instance| instance.send :admin_platforms_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_platform_path}

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "asc"
    sort_column = params[:sort_column] ? params[:sort_column] : "name"

    if sort_column == "media_type"
      sort_column = "media_types.category"
    elsif sort_column == "dfp_site_name"
      sort_column = "sites.name"
    end

    platforms = Platform.includes(:media_type, :site).of_network(current_network).order(sort_column + " " + sort_direction)
    @platforms = Kaminari.paginate_array(platforms).page(params[:page]).per(50)
  end

  def new

  end

  def show
    @platform = Platform.of_network(current_network).find(params[:id])
    respond_with(@platform)

    rescue => e
      respond_with(e.message, status: :service_unavailable)
  end

  def create
    @platform = Platform.new(platform_params)
    @platform.network_id = current_network.id
    @platform.save
    respond_with(@platform, location: nil)

    rescue => e
      respond_with(e.message, status: :service_unavailable)
  end

  def edit
    @platform = Platform.of_network(current_network).where(:id => params[:id]).first
    if @platform
      add_crumb "Edit - #{@platform.name}"
    else
      redirect_to admin_platforms_path
    end
  end

  def update
    @platform = Platform.find(params[:id])
    @platform.update_attributes(platform_params)
    respond_with(@platform)

    rescue => e
      respond_with(e.message, status: :service_unavailable)
  end

  def search
    @platforms = Platform.of_network(current_network).select(:name).distinct.order("name ASC")
    respond_with(@platforms)
  end

  private
    def platform_params
      params.require(:platform).permit(:name,:media_type_id, :dfp_key, :dfp_site_name, :naming_convention, :ad_type, :priority, :enabled)
    end

    def set_current_network
      Platform.current_network = current_network
    end
end
