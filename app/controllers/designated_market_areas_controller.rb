class DesignatedMarketAreasController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @dmas = DesignatedMarketArea.all

    respond_with(@dmas)
  end
end
