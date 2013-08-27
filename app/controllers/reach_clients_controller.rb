class ReachClientsController < ApplicationController
  respond_to :json

  def search
    @reach_clients = ReachClient.where("name ilike ?", "#{params[:search]}%").select('id, name').limit(8)

    render json: @reach_clients
  end
end
