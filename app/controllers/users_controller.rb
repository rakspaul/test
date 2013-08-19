class UsersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @users = User.of_network(current_network)
    respond_with(@users)
  end

end