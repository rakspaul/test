class UsersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @users = User.of_network(current_network).order('first_name ASC')
    respond_with(@users)
  end

end