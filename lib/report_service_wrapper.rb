require 'open-uri'

class ReportServiceWrapper
  SUPPORTED_PARAMS = ['group', 'cols', 'start_date', 'end_date', 'filter', 'per_page', 'offset', 'sort', 'limit', 'format']

  def initialize(current_user)
    @current_user = current_user
  end

  def load(params)
    sort_direction = params[:sort_direction] || 'asc'
    params[:sort] = "#{params[:sort_param]}:#{sort_direction}" unless params[:sort_param].blank?

    params.keep_if {|key, value| SUPPORTED_PARAMS.include? key}

    limit = params[:limit] unless params[:limit].nil?

    params.merge!({
      "instance" => @current_user.network.id,
      "user_id" => @current_user.id,
      "tkn" => build_request_token,
      "format" => params[:format] == 'xls' ? 'csv' : params[:format],
      "limit" => limit
    })

    query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")
    report_server = Rails.application.config.report_service_uri

    url = "#{report_server}?#{query_string}"
    response = nil
    open(url, :read_timeout => 3600) do |file|
      response = file.read
    end

    response
  end

  def build_request_token
    Digest::MD5.hexdigest("#{@current_user.network.id}:#{@current_user.id}:#{Date.today.strftime('%Y-%m-%d')}")
  end
end
