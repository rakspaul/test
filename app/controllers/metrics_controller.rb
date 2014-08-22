require 'report_service_wrapper'

class MetricsController < ApplicationController
  include Authenticator

  EXPORT_SRC = "reachui"

  respond_to :json

  before_filter :require_client_type_network_or_agency
  before_filter :require_order, :only => [:order_metrics]
  before_filter :require_report_wrapper, :only => [:order_metrics]

  def order_metrics
    o_metrics = {}

    begin
      # get the data from CDB only if the order's start date is before today
      # #(data in cdb is only available until the previous day)
      if @order.start_date < Date.current.beginning_of_day
        # Build query params for impressions, clicks, ctr, gross_rev and all_cogs
        query_params = {}
        query_params["start_date"] = @order.start_date.to_formatted_s(:iso8601) #yyyy-mm-dd
        query_params["end_date"] = @order.end_date.to_formatted_s(:iso8601)
        query_params["filter"] = "order_id:#{@order.id}"
        query_params["src"] = EXPORT_SRC;

        # Get record set 1
        record_set_1 = fetch_metrics_data(query_params.merge("cols" => 'impressions,clicks,ctr,gross_rev,all_cogs'))

        # Build query params for booked_impressions,booked_rev
        # Get record set 2
        record_set_2 = fetch_metrics_data(query_params.merge("cols" => 'booked_impressions,booked_rev'))

        if record_set_1["records"].present? and record_set_2["records"].present?
          o_metrics = process_order_metrics record_set_1["records"][0], record_set_2["records"], @order

          # Add agency user?
          o_metrics["agency_user"] = current_user.agency_user?

          # Add start and end dates
          o_metrics["start_date"] = @order.start_date.to_formatted_s(:rfc822) #dd mmm yyyy
          o_metrics["end_date"] = @order.end_date.to_formatted_s(:rfc822)
        else
          o_metrics["no_cdb_data"] = true
        end
      end
    rescue Exception => e
      o_metrics["cdb_unavailable"] = true
    end

    render json: (o_metrics.present? ? o_metrics.to_json : {not_started: true})
  end

  def lineitem_metrics

  end

  private

  def require_order
    @order ||= Order.find(params[:order_id])
  end

  def require_report_wrapper
    @wrapper ||= ReportServiceWrapper.new(current_user)
  end

  def fetch_metrics_data query_params
    response = @wrapper.load(query_params)
    begin
      record_set_1 = ActiveSupport::JSON.decode(response) #Single record with all the columns
    rescue MultiJson::LoadError => e
      Rails.logger.error "Invalid response from cdb: #{e.inspect}"
      raise e
    end
    response
  end

  def process_order_metrics(record_set1, record_set_2, order)
    metrics = {}

    # Process record set 1
    metrics["impressions"] = record_set1["impressions"]
    metrics["clicks"] = record_set1["clicks"]
    # CTR in %
    metrics["ctr"] = (record_set1["ctr"] * 100).round(2)
    metrics["gross_rev"] = record_set1["gross_rev"].round(2)

    # Calculate margin
    net_revenue = record_set1["gross_rev"] - record_set1["all_cogs"]
    metrics["margin"] = (record_set1["gross_rev"] != 0) ? ((net_revenue / record_set1["gross_rev"]) * 100).round(2) : 0;

    # Process record set 2
    metrics["booked_impressions"] = 0
    metrics["booked_rev"] = 0

    record_set_2.each { | record |
      metrics["booked_impressions"] += record["booked_impressions"]
      metrics["booked_rev"] += record["booked_rev"]
    }
    metrics["booked_rev"] = metrics["booked_rev"].round(2)

    metrics
  end
end
