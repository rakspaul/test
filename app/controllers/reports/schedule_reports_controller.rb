class Reports::ScheduleReportsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @reports = ReportSchedule.all
    respond_with(@reports)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create
  	@report = ReportSchedule.new(params[:report_schedule])
  	@report.user = current_user

	if @report.save
      respond_with(@reports, status: :ok)
    else
      render json: { errors: @report.errors }, status: :unprocessable_entity
    end
  end

  def update
  	@report = ReportSchedule.find_by_id(params[:id])
  	@report.update_attributes(params[:report])

  	if @report.save
      respond_with(@reports, status: :ok)
    else
      render json: { errors: @report.errors }, status: :unprocessable_entity
    end
  end

  def destroy
  	@report = ReportSchedule.find_by_id(params[:id])
  	@report.destroy
  	render status: :ok
  end	  

end  