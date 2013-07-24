class Reports::ColumnsController < ApplicationController
  include Authenticator
  respond_to :html, :json

  def index
    respond_with(ReportColumns.all)
  end
end
