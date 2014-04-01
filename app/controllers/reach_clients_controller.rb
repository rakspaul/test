class ReachClientsController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    @reach_clients = ReachClient.where("name ilike ?", "#{params[:search]}%").select('id, name, abbr').limit(8)

    render json: @reach_clients
  end
end
