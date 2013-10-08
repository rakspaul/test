class Admin::AudienceGroupsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json
  respond_to :csv, :only => :index

  add_crumb("Audience Groups") {|instance| instance.send :admin_audience_groups_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_audience_group_path}

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "asc"
    sort_column = params[:sort_column] ? params[:sort_column] : "name"
    @audience_groups = AudienceGroup.of_network(current_network).order("#{sort_column} #{sort_direction}")
    if params[:format] != 'csv'
      @audience_groups = Kaminari.paginate_array(@audience_groups).page(params[:page]).per(50);
    end
    @audience_groups
  end

  def new
  end

  def show
    @audience_group = AudienceGroup.of_network(current_network).where(:id => params[:id]).first
    respond_with(@audience_group)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create
    p = params.require(:audienceGroup).permit(:name, :key_values)
    adjust_key_value(p)

    @audience_group = AudienceGroup.new(p)
    @audience_group.network = current_network
    @audience_group.user = current_user
    @audience_group.save

    respond_with(@audience_group, location: nil)
  end

  def edit
    @audience_group = AudienceGroup.of_network(current_network).where(:id => params[:id]).first
    if @audience_group
      add_crumb "Edit - #{@audience_group.name}"
    else
      redirect_to admin_audience_groups_path
    end
  end

  def update
    @audience_group = AudienceGroup.find(params[:id])
    p = params.require(:audienceGroup).permit(:name, :key_values)
    adjust_key_value(p)

    @audience_group.update_attributes(p)
    @audience_group.save

    respond_with(@audience_group)
  end

  private
    def adjust_key_value(p)
      p[:key_values] = p[:key_values].split(/[\s\,]+/).map(&:strip).uniq.join(',')
      return
    end

end
