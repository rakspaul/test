class DesignatedMarketAreasController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @dmas = DesignatedMarketArea.all order: :name

    respond_with(@dmas)
  end

  def search_geo
    @geos = []
    @geos += DesignatedMarketArea.order(:name).where(['name ilike ?', "#{params[:search]}%"]).limit(10)
    @geos += State.in_us.xfp_present.order('states.name').includes(:country).where(['states.name ilike ?', "#{params[:search]}%"]).limit(10)
    @geos += City.in_us.xfp_present.order(:name).where(['name ilike ?', "#{params[:search]}%"]).limit(10)
    @geos = @geos[0..19]
  end
end
