class Reports::ReportsController < ApplicationController
  include Authenticator
  respond_to :html, :json
  add_crumb("Reports") {|instance| instance.send :reports_reports_path}
  add_crumb("New Report", only: "new") {|instance| instance.send :reports_reports_path}

  def index
  end

  def new
  end

  def edit
    @report = ReportSchedule.of_user_by_id(params[:id])

    if @report
      add_crumb "Edit - #{@report.title}"
    else
      # redirect user to report list page
      redirect_to reports_reports_path
    end
  end

end
