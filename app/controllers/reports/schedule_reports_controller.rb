class Reports::ScheduleReportsController < ApplicationController
  include Authenticator
  SUPPORTED_PARAMS = ['group', 'cols', 'start_date', 'end_date', 'filter', 'per_page', 'offset', 'sort', 'limit', 'format']

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

    params.clone.keep_if {|key, value| SUPPORTED_PARAMS.include? key}
    params.merge!({
      "instance" => @current_user.network.id,
      "user_id" => @current_user.id,
      "tkn" => build_request_token
     })

    query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")
    report_server = Rails.application.config.report_service_uri
    url = "#{report_server}?#{query_string}"

    @report.url = url
  	
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

  def build_request_token
    Digest::MD5.hexdigest("#{@current_user.network.id}:#{@current_user.id}:#{Date.today.strftime('%Y-%m-%d')}")
  end	  

end  