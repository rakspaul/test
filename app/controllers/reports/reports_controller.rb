class Reports::ReportsController < ApplicationController
  include Authenticator
  respond_to :html, :json
  add_crumb("Reports") {|instance| instance.send :reports_reports_path}
  add_crumb("New Report", only: "new") {|instance| instance.send :reports_reports_path}

  def index
  end

  def new
  end


  def dimensions
  	respond_with(Dimensions.all)
  end

  def columns
  	respond_with(Columns.all)
  end
end
