require 'nokogiri'
require 'open-uri'
require 'csv'

  class LoadDimensionsWrapper
    
    def load(group, cols, filter, start_date, end_date, current_network, current_user)

      params = {
        "instance" => current_network.id,
        "group" => group,
        "cols" => cols,
        "format" => "json",
        "start_date" => start_date,
        "end_date" => end_date,
        "limit" => "50",
        "user_id" => current_user.id,
        "filters" => filter
       }

      query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")      
      cdb_server = "http://stg-cdb1.collective-media.net/export"

      url = "#{cdb_server}?#{query_string}"
      puts "URL:-  " + url

      response = nil
      open(url, :read_timeout => 3600) do |file|
        response = file.read
      end

      data = ActiveSupport::JSON.decode(response)
      response = data['records']

      return response
    end

 end    