(function() {
  var constants = function () {
    this.CAMPAIGN_LIST_CANCELLER = 1;
    this.COST_CANCELLER = 2;
    this.DASHBOARD_CANCELLER = 3;
    this.GAUGE_CANCELLER = 4;
    this.DASHBOARD_CAMPAIGNS_COUNT_CANCELLER = 5;
    this.SPEND_CHART_CANCELLER = 51;
    this.SCREEN_CHART_CANCELLER = 52;
    this.GANTT_CHART_CANCELLER = 6;
    this.GANTT_CHART_BRAND_CANCELLER = 7;
    this.PERIOD_LIFE_TIME = 'life_time';
    this.PERIOD_LAST_7_DAYS = 'last_7_days';
    this.PERIOD_LAST_30_DAYS = 'last_30_days';
    this.SORT_DESC = 'desc';
    this.ACTIVE_UNDERPERFORMING = '(active,underperforming)';
    this.ACTIVE_ONTRACK = '(active,ontrack)';
    this.ONTRACK = 'ontrack';
    this.UNDERPERFORMING = 'underperforming';
    this.ACTIVE = 'active';
    this.DASHBOARD_STATUS_ACTIVE = "Active";
    this.DASHBOARD_STATUS_COMPLETED = "Completed";
    this.DASHBOARD_STATUS_ALL = "All";
    this.ALL_BRANDS = 'All Brands';
    this.EVENT_BRAND_CHANGED = "brandChanged";
    this.EVENT_BRAND_CHANGED_FROM_DASHBOARD = "brandChangedFromDashboard";
    this.EVENT_TIMEPERIOD_CHANGED = "timePeriodChanged";
    this.EVENT_ACTION_CREATED = "actionCreated";
    this.NAVIGATION_FROM_CAMPAIGNS = "navigationFromCampaigns";
    this.BUBBLE_BRAND_CLICKED = "bubbleBrandClicked";
    this.GA_DASHBOARD = 'dashboard-widget';
    this.GA_CLICK = 'click';
    this.GA_BRAND_SELECTED = 'brand_selected';
    this.GA_CAMPAIGN_DETAILS = 'campaign_details';
    this.GA_TIME_PERIOD_SELECTED = 'time_period_selected';
    this.GA_CAMPAIGN_STATUS_FILTER = 'campaign_status_filter';
    this.GA_CAMPAIGN_LIST_SORTING = 'campaign_LIST_sorting';
    this.GA_CAMPAIGN_CARD_ACTIVITY = 'campaign_card_activity';
    this.GA_CAMPAIGN_ACTIVITY_BUBBLE_COUNT = 'campaign_bubble_activity_count';
    this.GA_CAMPAIGN_CARD_VIEW_REPORT = 'campaign_card_view_report';
    this.GA_CAMPAIGN_DETAILS_CREATE_ACTIVITY = 'campaign_details_create_activity';
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
    this.GA_DOWNLOAD_REPORT = 'download_report';
    this.GA_USER_CAMPAIGN_SELECTION = 'user_campaign_selection';
    this.GA_USER_STRATEGY_SELECTION = 'user_strategy_selection';
    this.GAUGE_PERFORMANCE = 1;
    this.COOKIE_REDIRECT = "cdesk_redirect";
    this.COOKIE_SESSION = "cdesk_session";
    this.SPEND = "Spend";
    this.IMPRESSIONS ="Impressions";
    this.CTR = "CTR";
    this.CPM = "CPM";
    this.CPC = "CPC";
    this.CPA = "CPA";
    this.ACTION_RATE = "Action rate";
    this.SCREENS = "Screens";
    this.FORMATS = "Formats"



  }

  commonModule.service("constants", constants);

}());
