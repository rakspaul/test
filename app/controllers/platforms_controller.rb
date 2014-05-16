class PlatformsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @platforms = Platform.of_network(current_network).includes(:media_type)
    respond_with(@platforms)
  end
end
