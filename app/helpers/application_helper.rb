module ApplicationHelper
  APP_NAVIGATION_BAR = {
    "Reports::ReportsController" => ["Reports", :reports_reports],
    "OrdersController" => ["Orders", :orders]
  }

  def format_date(date)
    I18n.localize(date.in_time_zone("Eastern Time (US & Canada)"), :format => :short)
  end
end
