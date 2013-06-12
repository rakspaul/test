require 'nokogiri'
require 'open-uri'
require 'csv'

  class LoadDimensionsWrapper

    def load(user_id)
      params = {
      	"mg" => "none",
        "calltype" => "data",
        "pagesize" => "400",
        "viewtype" => "tree",
        "type" => "est",
        "listfilter" => "",
        "universe" => "network",
        "item" => "order",
        "listtype" => "advertiser",
        "detailtype" => "order",
        "detailfilter" => "",
        "sortDirection" => "ascending",
        "format" => "csv",
        "filtertype" => "",
        "sortField" => user_id,
        "usage" => "0",
        "pagestart" => "0",
        "grp" => "advertiser",
        "fromdate" => "2013-6-11",
        "todate" => "2013-6-11",
        "userid" => user_id,
        "tkn" => "19fe36418f8c5373977a90ba479c5764"
      }

      query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")
      cdb_server = "http://cm.qacdb.collective-media.net/delivery/data"

      url = "#{cdb_server}?#{query_string}"
      csv_results = []
      doc = Nokogiri::XML(open(url, :read_timeout => 3600))
      data = doc.at_xpath('.//data')

      unless data.nil?
        CSV.parse(data.text.strip, {:headers => :true, :quote_char => ','}) do |row|
          csv_results << row
        end
      end

      return csv_results
    end

 end   	