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
      controllers: ["Admin::ReachClientsController", "Admin::AudienceGroupsController", "Admin::BlockSitesController", "Admin::BlockedAdvertisersController", "Admin::DefaultBlockListController", "Admin::BlockLogsController", "Admin::BlockViolationsController", "Admin::PlatformsController"],
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
    tz = ActiveSupport::TimeZone.new(User::DEFAULT_TIMEZONE)
    I18n.localize(date.in_time_zone(tz), :format => :short) unless date.nil?
  end

  def format_datetime(datetime, format=:default)
    I18n.localize(datetime.in_time_zone(User::DEFAULT_TIMEZONE), :format => format) unless datetime.blank?
  end

  def format_datetime_with_tz(datetime)
    datetime.in_time_zone(User::DEFAULT_TIMEZONE) unless datetime.blank?
  end

  def html_code_excerpt(creative)
    if excerpt(creative.try(:html_code), '"id" :', radius: 22)
      excerpt(creative.try(:html_code), '"id" :', radius: 22)
    else
      h(creative.try(:html_code).try(:[], 0..60))
    end
  end
end
