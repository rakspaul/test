class Reports::ScheduleReportsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @reports = ReportSchedule.all
    respond_with(@reports)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def new
    @report_schedule = ReportSchedule.new
    @report_schedule.user = current_user
  end  

  def create
  	@report = ReportSchedule.new(params[:report_schedule])
  	
	  if !@report.save
      render json: { errors: @report.errors }, status: :unprocessable_entity
    end
  end

  def show
    @report = ReportSchedule.find(params[:id])
    render :json => @report.to_json
  rescue ActiveRecord::RecordNotFound  
    render :json => "Schedule report #{params[:id]} not found",
           :status => :ok 
    false
  end  

  def update
  	@report = ReportSchedule.find_by_id(params[:id])
  	@report.update_attributes(params[:report])

  	if !@report.save
      render json: { errors: @report.errors }, status: :unprocessable_entity
    end
  end

  def destroy
  	@report = ReportSchedule.find(params[:id])
  	@report.destroy
  end	  

end  