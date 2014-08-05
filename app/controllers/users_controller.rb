class UsersController < ApplicationController
  include Authenticator

  before_filter :set_users, :only => [:index, :search]

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

    respond_to do | format |
      format.json
      format.js do
        render :json => basic_user_info(@users), :callback => params[:callback]
      end
    end
  end

  private
  def set_users
    @users = User.of_network(current_network).joins(:roles)
             .where(roles: { name: Role::REACH_UI}, client_type: User::CLIENT_TYPE_NETWORK)
             .order("first_name, last_name")
  end

  def basic_user_info(u)
    list = u.map { | user |
      {
          id: user.id,
          name: user.first_name << " " << user.last_name,
          email: user.email
      }
    }

    list.to_json
  end
end
