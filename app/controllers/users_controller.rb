class UsersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @users = User.of_network(current_network).order('first_name ASC')
    respond_with(@users)
  end

  def search
    @users = User.of_network(current_network).limit(8)

    @users = if params[:search_by] == 'email'
      @users.where("email ilike ?", "#{params[:search]}%")
    elsif params[:search_by] == 'name'
      @users.where("(first_name || ' ' || last_name) ilike ?", "#{params[:search]}%")
    end

    respond_with(@users)
  end
end
