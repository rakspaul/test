require 'report_service_wrapper'

class MetricsController < ApplicationController
  include Authenticator

  EXPORT_SRC = "reachui"

  respond_to :json

  before_filter :require_client_type_network_or_agency

  def order_metrics
    wrapper = ReportServiceWrapper.new(@current_user)

    order = Order.find(params[:order_id])
    o_metrics = {}

    begin
      # get the data from CDB only if the order's start date is before today
      # #(data in cdb is only available until the previous day)
      if order.start_date < Date.current.beginning_of_day
        # Build query params for impressions, clicks, ctr, gross_rev and all_cogs
        query_params = {}
        query_params["start_date"] = order.start_date.to_formatted_s(:iso8601) #yyyy-mm-dd
        query_params["end_date"] = order.end_date.to_formatted_s(:iso8601)
        query_params["cols"] = 'impressions,clicks,ctr,gross_rev,all_cogs'
        query_params["filter"] = 'order_id:' << order.id.to_s
        query_params["src"] = EXPORT_SRC;

        # Get record set 1
        response = wrapper.load(query_params)
        record_set_1 = ActiveSupport::JSON.decode(response) #Single record with all the columns

        # Build query params for impressions, clicks, ctr, gross_rev and all_cogs
        query_params = {}
        query_params["start_date"] = order.start_date.to_formatted_s(:iso8601) #yyyy-mm-dd
        query_params["end_date"] = order.end_date.to_formatted_s(:iso8601)
        query_params["cols"] = 'booked_impressions,booked_rev'
        query_params["filter"] = 'order_id:' << order.id.to_s
        query_params["src"] = EXPORT_SRC;

        # Get record set 2
        response = wrapper.load(query_params)
        record_set_2 = ActiveSupport::JSON.decode(response) #Multiple records with the booked impressions and revenue

        o_metrics = process_order_metrics record_set_1["records"][0], record_set_2["records"], order

        # Add agency user?
        o_metrics["agency_user"] = current_user.agency_user?

        # Add start and end dates
        o_metrics["start_date"] = order.start_date.to_formatted_s(:rfc822) #dd mmm yyyy
        o_metrics["end_date"] = order.end_date.to_formatted_s(:rfc822)
      end
    rescue
      o_metrics["cdb_unavailable"] = true
    end

    render json: (o_metrics.size > 0 ? o_metrics.to_json : {not_started: true})
  end

  def lineitem_metrics

  end

  private
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
