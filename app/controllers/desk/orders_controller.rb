class Desk::OrdersController < Desk::DeskController

  layout "cdesk"

  respond_to :html, :json, :js

  before_filter :add_default_filter, :only => [:index]

  # Accepted parameters:
  #   sort_direction, sort_column for sorting
  #   filter: {name: value[, name: value]}
  # Supported filters:
  #   name: advertiser_filter, value: advertiser id
  #   name: date_filter, value: last_week/last_month/custom_dates
  #   name: start_date, value: date
  #   name: end_date, value: date
  # Ex: filter => {advertiser_filter: 1, date_filter: last_week/last_month/custom_dates, start_date: date1, end_date: date2}
  def index
    param_sort_direction = params[:sort_direction] || "desc"

    # :io_detail - for order status
    # :advertiser - for brand name
    # :lineitems - for lineitem/strategy count
    user_orders
    @orders = @arel.includes(:lineitems, :io_detail, :advertiser)
                    .where("io_details.state in ('delivering', 'draft', 'completed')")
                    .order("#{param_sort_column} #{param_sort_direction}")
                    .page(params[:page]).per(5)
                    .references(:lineitems, :io_detail, :advertiser)

    respond_to do | format |
      format.html
      format.json
      format.js
    end
  end

  private

  def param_sort_column
    sort_field = params[:sort_column] || "orders.start_date"
    sort_column = case sort_field
                    when "id"
                      "orders.id"
                    when "order_name"
                      "orders.name"
                    when "advertiser"
                      "network_advertisers.name"
                    when "status"
                      "io_details.state"
                    when "start_date"
                      "orders.start_date"
                    else
                      sort_field
                  end
  end

  def user_orders
    @arel = if current_user.agency_user?
              Order.where(:agency => current_user.agency)
            else
              Order.where(:network => current_network)
            end
    apply_filters
  end

  def apply_filters
    params[:filter].each_pair do |filter_name, filter_value|
      "apply_#{filter_name}".to_sym.tap do |filter|
        send filter if respond_to?(filter, true)
      end
    end
  end

  def apply_advertiser_filter
    @arel = @arel.where(:network_advertiser_id => params[:filter][:advertiser_filter])
  end

  def apply_date_filter
    # @arel = @arel.where("start_date <= #{params[:filter][:start_date]} and #{params[:filter][:end_date]} <= end_date")
    window_start_date = params[:filter][:start_date]
    window_end_date = params[:filter][:end_date]
    @arel = @arel.where("(date('#{window_start_date}') <= orders.start_date and date('#{window_end_date}') >= orders.start_date) or
                          (date('#{window_start_date}') <= orders.end_date and date('#{window_end_date}') >= orders.end_date) or
                          (orders.start_date <= date('#{window_start_date}') and orders.end_date >= date('#{window_end_date}'))")
  end

  def add_default_filter
    # default filter
    params[:filter] ||= {"date_filter" => "last_week"}
    params[:filter][:date_filter] ||= "last_week"
    case params[:filter][:date_filter]
      when "last_week"
        params[:filter][:start_date] = 7.days.ago.beginning_of_day.to_date
        params[:filter][:end_date] = Date.yesterday.end_of_day.to_date
      when "last_month"
        params[:filter][:start_date] = 1.month.ago.beginning_of_day.to_date
        params[:filter][:end_date] = Date.yesterday.end_of_day.to_date
      when "last_year"
        params[:filter][:start_date] = 1.year.ago.beginning_of_day.to_date
        params[:filter][:end_date] = Date.yesterday.end_of_day.to_date
      when "life_time"
        params[:filter][:start_date] = 5.years.ago.beginning_of_day.to_date
        params[:filter][:end_date] = 5.years.from_now.end_of_day.to_date
      when "custom_dates"
        params[:filter][:start_date] = params[:filter][:start_date].to_date
        params[:filter][:end_date] = params[:filter][:end_date].to_date
    end
  end
end