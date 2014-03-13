class AgencyController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @agencies = Agency.of_network(current_network).order('name asc')
  end
end
