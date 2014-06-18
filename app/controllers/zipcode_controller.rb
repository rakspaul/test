class ZipcodeController < ApplicationController
  include Authenticator

  respond_to :html,:json

  def validate
    geos = GeoTarget::Zipcode.where(['name IN (?)', params[:zipcodes]]).pluck(:name)

    render json: {message: geos}
  end
end
