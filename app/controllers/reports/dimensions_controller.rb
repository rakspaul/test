class Reports::DimensionsController < ApplicationController
  include Authenticator
  respond_to :html, :json

  def index
    respond_with(ReportDimensions.all)
  end
end
