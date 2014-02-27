class UsersController < ApplicationController
  include Authenticator

  before_filter :set_users, :only => [:index, :search]

  respond_to :json

  def index
  end

  def search
    @users = @users.limit(25)
    @users = if params[:search_by] == 'email'
      @users.where("email ilike ?", "#{params[:search]}%")
    elsif params[:search_by] == 'name'
      @users.where("(first_name || ' ' || last_name) ilike ?", "#{params[:search]}%")
    else
      @users.where("email ilike :term OR (first_name || ' ' || last_name) ilike :term", {:term => "#{params[:search]}%"})
    end

    respond_with(@users)
  end

  private
  def set_users
    @users = User.of_network(current_network).joins(:roles)
             .where(roles: { name: [Role::REACH_UI, Role::REACHUI_USER]}, client_type: User::CLIENT_TYPE_NETWORK)
             .with_counts.order("first_name, last_name")
  end

end
