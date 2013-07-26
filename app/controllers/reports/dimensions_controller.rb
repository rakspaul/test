class Reports::DimensionsController < ApplicationController
  include Authenticator
  respond_to :json

  def index
    respond_with(ReportDimensions.all)
  end
end
