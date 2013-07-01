require 'report_service_wrapper'

class Reports::QueryController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    wrapper = ReportServiceWrapper.new(@current_user)
    resp = wrapper.load(params.clone)
    respond_with(resp)
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end
end
