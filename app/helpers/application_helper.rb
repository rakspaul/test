module ApplicationHelper
  APP_NAVIGATION_BAR = {
    "Reports::ReportsController" => ["Reports", :reports_reports],
    "Orders::OrdersController" => ["Orders", :orders_orders],
    "KendouiController" => ["Kendo UI", :kendoui_index]
  }
end
