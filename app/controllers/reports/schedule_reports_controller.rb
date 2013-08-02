require 'report_service_wrapper'

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
    @report_schedule = ReportSchedule.new(schedule_report_params)
    @report_schedule.user_id = @current_user.id
    @report_schedule.url = create_url(params[:report_schedule])
    @report_schedule.save

    respond_with(@report_schedule, location: nil)
  end

  def update
    @report_schedule = ReportSchedule.find_by_id(params[:id])
    @report_schedule.update_attributes(schedule_report_params)
    @report_schedule.save

    respond_with(@report_schedule)
  end

  def destroy
    @report_schedule = ReportSchedule.find(params[:id])
    @report_schedule.destroy

    respond_with(@report_schedule)
  end

  private
    def create_url(p)
      wrapper = ReportServiceWrapper.new(@current_user)

      p.keep_if {|key, value| ReportServiceWrapper::SUPPORTED_PARAMS.include? key}
      p.merge!({
        "instance" => @current_user.network.id,
        "user_id" => @current_user.id,
        "tkn" => wrapper.build_request_token
      })

      query_string = p.map {|k,v| "#{k}=#{v}"}.join("&")
      report_server = Rails.application.config.report_service_uri
      url = "#{report_server}?#{query_string}"

      url
    end

    def schedule_report_params
      params.require(:report_schedule).permit(:title, :email, :recalculate_dates, :start_date, :end_date, :report_start_date, :report_end_date, :frequency_value, :frequency_type)
    end

end
