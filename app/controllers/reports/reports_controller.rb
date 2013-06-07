class Reports::ReportsController < ApplicationController
  include Authenticator

  add_crumb("Reports") {|instance| instance.send :reports_reports_path}
  add_crumb("New Report", only: "new") {|instance| instance.send :reports_reports_path}

  def index
    Rails.logger.info
  end

  def new
  end
end
