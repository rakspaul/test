module ApplicationHelper
  APP_NAVIGATION_BAR = {
    "Reports::ReportsController" => ["Reports", :reports_reports],
    "Buying::OrdersController" => ["Orders", :buying_orders],
    "KendouiController" => ["Kendo UI", :kendoui_index]
  }
end
