class UsersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @users = User.of_network(current_network).order('first_name ASC')
    respond_with(@users)
  end

  def search
    @users = if params[:search_by] == 'email'
      User.where("email ilike ?", "#{params[:search]}%").limit(8).pluck("email")
    elsif params[:search_by] == 'name'
      User.where("concat(first_name,' ',last_name) ilike ?", "#{params[:search]}%").limit(8).pluck("first_name, last_name").map{|u| u.join(' ')}
    end

    render :json => @users.to_json
  end

end
