module ApplicationHelper
  APP_NAVIGATION_BAR = {
    "Reports" => {
      controllers: ["Reports::ReportsController"],
      path: :reports_reports
    },

    "Orders" => {
      controllers: ["OrdersController","LineitemsController"],
      path: :orders
    }
  }

  def format_date(date)
    I18n.localize(date.in_time_zone("Eastern Time (US & Canada)"), :format => :short) unless date.nil?
  end

  def format_datetime(datetime)
    I18n.localize(datetime.in_time_zone("Eastern Time (US & Canada)")) unless datetime.nil?
  end
end
