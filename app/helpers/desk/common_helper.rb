module Desk::CommonHelper
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