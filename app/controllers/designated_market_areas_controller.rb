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
    @geos += State.order(:name).includes(:country).where(['name ilike ?', "#{params[:search]}%"]).limit(10)
    @geos += City.order(:name).where(['name ilike ?', "#{params[:search]}%"]).limit(10)
  end
end
