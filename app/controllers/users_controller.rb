class UsersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @users = User.of_network(current_network).where("email like ?", "%@collective.com%").order('first_name ASC')
    respond_with(@users)
  end

  def search
    @users = User.of_network(current_network).limit(25)

    @users = if params[:search_by] == 'email'
      @users.where("email ilike ?", "#{params[:search]}%")
    elsif params[:search_by] == 'name'
      @users.where("(first_name || ' ' || last_name) ilike ?", "#{params[:search]}%")
    else
      @users.where("email ilike :term OR (first_name || ' ' || last_name) ilike :term", {:term => "#{params[:search]}%"})
    end

    respond_with(@users)
  end
end
