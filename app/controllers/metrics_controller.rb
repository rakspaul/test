require 'report_service_wrapper'

class MetricsController < ApplicationController
  include Authenticator

  respond_to :json

  before_filter :require_client_type_network_or_agency

  def get_token
    wrapper = ReportServiceWrapper.new(current_user)

    render json: {current_user_id: current_user.id, tkn: wrapper.build_request_token}
  end

  def get_cdb_export_uri
    render json: {export_uri: Rails.application.config.report_service_uri}
  end
end
