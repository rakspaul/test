class ReportsController < ApplicationController
  include Authenticator

  add_crumb("Reports") {|instance| instance.send :reports_path}
  add_crumb("New Report", only: "new") {|instance| instance.send :reports_path}

  def index
  end

  def new
  end
end
