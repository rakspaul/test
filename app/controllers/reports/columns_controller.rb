class Reports::ColumnsController < ApplicationController
  include Authenticator
  respond_to :json

  def index
    respond_with(ReportColumns.all)
  end
end
