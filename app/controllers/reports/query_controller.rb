require 'report_service_wrapper'
require 'tempfile'

class Reports::QueryController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    wrapper = ReportServiceWrapper.new(@current_user)
    resp = wrapper.load(params.clone)

    respond_with(resp) { |format| format.csv {export_report(resp)} }
   
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def export_report(resp)
  	file_path = get_file_path

    begin
      temp_file = Tempfile.new(['report', '.csv'])
      temp_file.write(resp.force_encoding('utf-8'))	
      send_file temp_file.path, :type => "text/csv", :x_sendfile => true, :filename => "#{file_path}.csv"
    ensure
      temp_file.close
    end  
  end

  def get_file_path
    "#{Date.today.strftime('%Y-%m-%d')}_Report_#{current_user.network.id}_#{@current_user.id}"
  end	

end
	