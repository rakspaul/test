require 'report_service_wrapper'

class MetricsController < ApplicationController
  include Authenticator
  include MetricsHelper

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
        record_set_1 = fetch_metrics_data(query_params.merge(
                                              "cols" => "impressions,clicks,ctr,gross_rev,all_cogs,#{cdb_kpi_fields(@order.kpi_type)}"))

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
    json = nil
    begin
      json = ActiveSupport::JSON.decode(response) #Single record with all the columns
    rescue MultiJson::LoadError => e
      Rails.logger.error "Invalid response from cdb: #{e.inspect}"
      raise e
    end
    json
  end

  def process_order_metrics(record_set_1, record_set_2, order)
    metrics = {}

    # Process record set 1
    ["impressions", "clicks", "post_imp", "post_click", "completion_100"].each do |field|
      next unless record_set_1[field]
      metrics[field] = record_set_1[field]
    end
    ["gross_ecpm", "gross_ecpc", "gross_ecpa", "gross_rev"].each do |field|
      next unless record_set_1[field]
      metrics[field] = record_set_1[field].round(2)
    end

    # CTR in %
    metrics["ctr"] = (record_set_1["ctr"] * 100).round(2)
    metrics["complete_rate"] = (record_set_1["complete_rate"] * 100).round(2) if record_set_1["complete_rate"]

    # Calculate margin
    net_revenue = record_set_1["gross_rev"] - record_set_1["all_cogs"]
    metrics["margin"] = (record_set_1["gross_rev"] != 0) ? ((net_revenue / record_set_1["gross_rev"]) * 100).round(2) : 0;

    # Process record set 2
    metrics["booked_impressions"] = 0
    metrics["booked_rev"] = 0

    record_set_2.each { | record |
      metrics["booked_impressions"] += record["booked_impressions"]
      metrics["booked_rev"] += record["booked_rev"]
    }
    metrics["booked_rev"] = metrics["booked_rev"].round(2)

    if @order.kpi_tracking_enabled?
      metrics["kpi_type"] = @order.kpi_type

      metrics["kpi_value"] = @order.kpi_value
      metrics["kpi_value_display"] = kpi_value_display(@order.kpi_type, metrics["kpi_value"])

      metrics["actual_kpi_value"] = actual_kpi_value(@order.kpi_type, metrics)
      metrics["actual_kpi_value_display"] = kpi_value_display(@order.kpi_type, metrics["actual_kpi_value"])

      metrics["kpi_value_display_color"] = track_kpi_value_progress(@order.kpi_type, metrics)
    end

    metrics
  end

end
