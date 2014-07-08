class GeoTargetsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @geos = GeoTarget::DesignatedMarketArea.order(:name).load

    respond_with(@geos)
  end

  def search
    @geos = GeoTarget.search params[:search]
    @geos = @geos[0..19]
  end
end
