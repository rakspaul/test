require 'report_service_wrapper'
require 'tempfile'
require 'csv'

class Reports::QueryController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    wrapper = ReportServiceWrapper.new(@current_user)
    response = wrapper.load(params.clone)
    resp = process_resp(response)

    respond_with(resp) do |format|
      format.csv { export_csv(converter(resp["records"].to_json)) }
      format.xls { export_excel(converter(resp["records"].to_json)) }
    end
  rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def process_resp(resp)
    records = ActiveSupport::JSON.decode(resp)
    columns = params[:cols].split(",")

    records["records"].each do |obj|
      obj["cogs"] = obj["cogs"] * 1.1 if obj.key?("cogs")
      obj["cogs_ecpm"] = obj["cogs"] / obj["impressions"] * 1000 if columns.include?("cogs_ecpm")
      obj["tech_cogs"] = obj["cogs"] * 0.1 if columns.include?("tech_cogs")
    end

    records
  end

  def converter(json_data)
    json = JSON.parse(json_data)
    json.first.collect {|k,v| k}.join(',')
    header = json.first.collect {|k,v| k}.join(',')
    data = json.collect {|node| "#{node.collect{|k,v| v}.join(',')}\n"}.join

    header+"\n"+data
  end

  def export_csv(resp)
    begin
      temp_file = Tempfile.new('report')
      temp_file.write(resp.force_encoding('utf-8'))
      send_file temp_file.path, :type => "text/csv", :x_sendfile => true, :filename => "#{get_file_path}.csv"
    ensure
      temp_file.close
    end
  end

  def export_excel(resp)
    Spreadsheet.client_encoding = 'UTF-8'
    book = Spreadsheet::Workbook.new
    sheet = book.create_worksheet :name => "Report Data"
    row_no = 0
    CSV.parse(resp.gsub(/\\\"/,'\\'=>'\\\\', '"' => '\\"'), :skip_blanks => true, :encoding => 'u') do |row_data|
      xls_row = sheet.row(row_no)
      col_no = 0
      row_data.each do |col|
        if is_number?(col)
          xls_row[col_no] = col.to_f ? col.to_f : col.to_i
        else
          xls_row[col_no] = col
        end
        col_no += 1
      end
      row_no += 1
    end
    spreadsheet = StringIO.new
    book.write spreadsheet
    send_data spreadsheet.string, :filename => "#{get_file_path}.xls", :type => "application/vnd.ms-excel"
  end

  def is_number?(col)
    true if Float(col) rescue false
  end

  def get_file_path
    "#{Date.today.strftime('%Y-%m-%d')}_Report_#{current_user.network.id}_#{@current_user.id}"
  end
end