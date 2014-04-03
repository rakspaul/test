module ApplicationHelper
  APP_NAVIGATION_BAR = {

    "Orders" => {
      controllers: ["OrdersController","LineitemsController"],
      path: :orders
    },

    "Reports" => {
      controllers: ["Reports::ReportsController"],
      path: :reports_reports
    },

    "Nielsen OCR" => {
      controllers: ["NielsenOcrsController"],
      path: :nielsen_ocrs
    },

    "Admin" => {
      controllers: ["Admin::ReachClientsController", "Admin::AudienceGroupsController", "Admin::BlockSitesController", "Admin::BlockedAdvertisersController", "Admin::DefaultBlockListController", "Admin::BlockLogsController", "Admin::BlockViolationsController"],
      path: :admin_reach_clients
    }
  }

  APP_NAVIGATION_BAR_AGENCY = {
    "Orders" => {
      controllers: ["OrdersController","LineitemsController"],
      path: :orders
    }
  }

  def format_date(date)
    tz = ActiveSupport::TimeZone.new("Eastern Time (US & Canada)")
    I18n.localize(date.in_time_zone(tz), :format => :short) unless date.nil?
  end

  def format_datetime(datetime)
    I18n.localize(datetime.in_time_zone("Eastern Time (US & Canada)")) unless datetime.blank?
  end

  def html_code_excerpt(creative)
    if excerpt(creative.try(:html_code), '"id" :', radius: 22)
      excerpt(creative.try(:html_code), '"id" :', radius: 22)
    else
      h(creative.try(:html_code).try(:[], 0..60))
    end
  end
end
