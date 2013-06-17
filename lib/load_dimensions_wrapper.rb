require 'nokogiri'
require 'open-uri'
require 'csv'

  class LoadDimensionsWrapper

    def load(user_id, dimensions, from_date, to_date, current_network, expand_id)
      arr = dimensions

      if arr.length == 1
        list_type = arr[0]
        detail_type = arr[0]
        item = arr[0]
        grp = arr[0]
      else
        list_type = arr[0]
        detail_type = arr[1]
        item = arr[1]
        grp = arr[0]
        parent_type = arr[0]
        detail_id = expand_id
        parent_id = expand_id
      end  

      params = {
        "calltype" => "data",
        "viewtype" => "tree",
        "type" => "est",
        "universe" => "network",
        "listtype" => list_type,
        "detailtype" => detail_type,
        "item" => item,
        "grp" => grp,
        "format" => "csv",
        "sortField" => user_id,
        "usage" => "0",
        "pagesize" => "20",
        "pagestart" => "0",
        "sortDirection" => "ascending",
        "fromdate" => from_date,
        "todate" => to_date,
        "userid" => user_id,
        "tkn" => Digest::MD5.hexdigest("#{current_network.id}:#{user_id}:#{Date.today.strftime('%Y-%m-%d')}")
      }

      if expand_id != ""
        params = { "detailid" => detail_id, "parentid" => parent_id, "parenttype" => parent_type }.merge(params)
      end  

      query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")

      cdb_server = "http://cm.qacdb.collective-media.net/delivery/data"

      url = "#{cdb_server}?#{query_string}"
      csv_results = []
      doc = Nokogiri::XML(open(url, :read_timeout => 3600))
      data = doc.at_xpath('.//data')

      unless data.nil?
        CSV.parse(data.text.delete('"').strip, {:headers => :true, :quote_char => ','}) do |row|
          dr = Result.new
          dr.id = row['id']  
          dr.name = row['name']
	   dr.type = row['type']
          dr.impressions = row['impressions']
          dr.clicks = row['clicks']
          dr.ctr = row['ctr']
          dr.pccr = row['pccr']
          dr.actions = row['actions']
          dr.ar = row['ar']
          dr.gross_rev = row['gross_rev']
          dr.gross_ecpm = row['gross_ecpm']
          dr.net_ecpc = row['net_ecpc']
          dr.net_ecpa = row['net_ecpa']

          csv_results << dr
        end
      end

      return csv_results
    end

 end    