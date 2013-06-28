require 'open-uri'

  class LoadDimensionsWrapper

    def load(current_network, current_user, group, cols, filter, per_page, offset, start_date, end_date)
      params = {
        "instance" => current_network.id,
        "format" => "json",
        "limit" => "50",
        "user_id" => current_user.id,
        "tkn" => Digest::MD5.hexdigest("#{current_network.id}:#{current_user.id}:#{Date.today.strftime('%Y-%m-%d')}")
      }

      params["group"] = group unless group.nil?
      params["cols"] = cols unless cols.nil?
      params["start_date"] = start_date unless start_date.nil?
      params["end_date"] = end_date unless end_date.nil?
      params["filter"] = filter unless filter.nil?
      params["per_page"] = per_page unless per_page.nil?
      params["offset"] = offset unless offset.nil?

      query_string = params.map {|k,v| "#{k}=#{v}"}.join("&")      
      cdb_server = "http://stg-cdb1.collective-media.net/export"
      url = "#{cdb_server}?#{query_string}"

      response = nil
      open(url, :read_timeout => 3600) do |file|
        response = file.read
      end

      data = ActiveSupport::JSON.decode(response)

      return data
    end

 end    