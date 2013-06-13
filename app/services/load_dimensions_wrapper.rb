require 'nokogiri'
require 'open-uri'
require 'csv'

  class LoadDimensionsWrapper

    def load(user_id, dimensions, from_date, to_date, current_network)
      arr = []
      arr = dimensions.split(",")

      if arr.length == 1
        if arr[0] == "order"
          list_type = "order"
          detail_type = "advertiser"
        else
          list_type = "advertiser"
          detail_type = "order"
        end    
      else
        list_type = arr[0]
        detail_type = arr[1]
      end  

      params = {
        "calltype" => "data",
        "viewtype" => "tree",
        "type" => "est",
        "universe" => "network",
        "listtype" => list_type,
        "detailtype" => detail_type,
        "format" => "csv",
        "sortField" => user_id,
        "usage" => "0",
        "pagesize" => "200",
        "pagestart" => "0",
        "sortDirection" => "ascending",
        "fromdate" => from_date,
        "todate" => to_date,
        "userid" => user_id,
        "tkn" => Digest::MD5.hexdigest("#{current_network.id}:#{user_id}:#{Date.today.strftime('%Y-%m-%d')}")
      }

      query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")

      #cdb_server = current_network.ssp_cdb_url + "delivery/data"
      cdb_server = "http://cm.qacdb.collective-media.net/delivery/data"

      url = "#{cdb_server}?#{query_string}"
      puts url
      csv_results = []
      doc = Nokogiri::XML(open(url, :read_timeout => 3600))
      data = doc.at_xpath('.//data')

      unless data.nil?
        CSV.parse(data.text.delete('"').strip, {:headers => :true, :quote_char => ','}) do |row|
          dr = Result.new
          dr.id = row['id'].strip
          dr.name = row['name']
          dr.type = row['type']
          dr.ad_start = row['ad_start']
          dr.ad_end = row['ad_start']
          csv_results << dr
        end
      end

      return csv_results
    end

 end   	