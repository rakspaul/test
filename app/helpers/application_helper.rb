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
    I18n.localize(date.in_time_zone("Eastern Time (US & Canada)"), :format => :short)
  end
end
