module ApplicationHelper
  include I18nHelper
  APP_NAVIGATION_BAR = {

    "Orders" => {
      controllers: ["OrdersController","LineitemsController"],
      path: :orders
    },

    "Reports" => {
      controllers: ["Reports::ReportsController"],
      path: :reports_reports
    },

    "Admin" => {
      controllers: ["Admin::ReachClientsController", "Admin::AudienceGroupsController", "Admin::BlockSitesController", "Admin::BlockedAdvertisersController", "Admin::DefaultBlockListController", "Admin::BlockLogsController", "Admin::BlockViolationsController", "Admin::PlatformsController"],
      path: :admin_reach_clients
    }
  }

  def app_navigation_bar_cdesk
    {

      localised(identifier + ".campaigns") => {
        controllers: ["Desk::OrdersController", "CampaignsController", "LineitemsController"],
        path: :campaigns
      },

      localised(identifier + ".reports") => {
        controllers: ["Reports::ReportsController"],
        path: :reports_reports
      }

    }
  end


  APP_NAVIGATION_BAR_AGENCY = {
    "Orders" => {
      controllers: ["OrdersController", "LineitemsController"],
      path: :orders
    }
  }

  def format_date(date)
    #tz = ActiveSupport::TimeZone.new("Eastern Time (US & Canada)")
    #I18n.localize(date.in_time_zone(tz), :format => :short) unless date.nil?
    date.to_date.to_s if date
  end

  def format_datetime(datetime, format=:default)
    #I18n.localize(datetime.in_time_zone("Eastern Time (US & Canada)")) unless datetime.blank?
    #datetime = datetime.to_date if datetime.is_a?(String)
    datetime.to_date.to_s if datetime
  end

  def format_date_with_time(datetime, format=:default)
    I18n.localize(datetime.in_time_zone(User::DEFAULT_TIMEZONE), :format => format) unless datetime.blank?
  end

  def html_code_excerpt(creative)
    if excerpt(creative.try(:html_code), '"id" :', radius: 22)
      excerpt(creative.try(:html_code), '"id" :', radius: 22)
    else
      h(creative.try(:html_code).try(:[], 0..60))
    end
  end

  def reports_api_url
    Rails.application.config.reporting_uri
  end
end
