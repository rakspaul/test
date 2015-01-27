(function() {
  var constants = function () {
    this.CAMPAIGN_LIST_CANCELLER = 1;
    this.COST_CANCELLER = 2;
    this.DASHBOARD_CANCELLER = 3;
    this.PERIOD_LIFE_TIME = 'life_time';
    this.PERIOD_LAST_7_DAYS = 'last_7_days';
    this.PERIOD_LAST_30_DAYS = 'last_30_days';
    this.SORT_DESC = 'desc';
    this.ACTIVE_UNDERPERFORMING = '(active,underperforming)';
    this.ALL_BRANDS = 'All Brands';
    this.EVENT_BRAND_CHANGED = "brandChanged";
    this.EVENT_TIMEPERIOD_CHANGED = "timePeriodChanged";
    this.NAVIGATION_FROM_CAMPAIGNS = "navigationFromCampaigns";
    this.GA_DASHBOARD = 'dashboard-widget';
    this.GA_CLICK = 'click';
    this.GA_BRAND_SELECTED = 'brand_selected';
    this.GA_EVENT = 'event';
    this.GA_SEND = 'send';
    this.ROLE_NETWORK = 'Network';
    this.ROLE_MARKETER = 'Marketer';
    this.GA_PERF_DAYS_OF_WEEK = 'performance_days_of_week_selected';
    this.GA_PERF_SCREENS = 'performance_screens_selected';
    this.GA_PERF_FORMATS = 'performance_formats_selected';
    this.GA_COST_METRIC_SELECTED = 'cost_metric_selected';
    this.GA_COST_TAB_SORTING = 'cost_tab_sorting';
    this.GA_INVENTORY_TAB_USER_SELECTION = 'inventory_tab_user_selection';
    this.GA_INVENTORY_TAB_PERFORMANCE = 'inventory_tab_performance';
    this.GA_INVENTORY_TAB_METRIC_SELECTED = 'inventory_tab_metric_selected';
    this.GA_VIEWABILITY_TAB_METRIC_SELECTED = 'viewability_tab_metric_selected';
    this.GA_OPTIMIZATION_TAB = 'optimization_tab';
    this.GA_OPTIMIZATION_TAB_SEE_DATES = 'optimization_tab_see_dates_selected';
    this.GAUGE_PERFORMANCE = 1;
  }

  commonModule.service("constants", constants);

}());