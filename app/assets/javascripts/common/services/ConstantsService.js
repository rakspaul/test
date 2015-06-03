(function() {
  var constants = function () {
    this.CAMPAIGN_LIST_CANCELLER = 1;
    this.COST_CANCELLER = 2;
    this.DASHBOARD_CANCELLER = 3;
    this.GAUGE_CANCELLER = 4;
    this.DASHBOARD_CAMPAIGNS_COUNT_CANCELLER = 5;
    this.SPEND_CHART_CANCELLER = 51;
    this.SCREEN_CHART_CANCELLER = 52;
    this.BUBBLE_CHART_CAMPAIGN_CANCELLER =53;
    this.INVENTORY_STRATEGY_CANCELLER = 54;
    this.INVENTORY_TACTC_CANCELLER = 55;
    this.STRATEGY_LIST_CANCELLER =10;
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
    this.EVENT_CAMPAIGN_CHANGED = "campaignChanged";
    this.EVENT_STRATEGY_CHANGED = "strategyChanged" ;
    this.EVENT_CAMPAIGN_STRATEGY_CHANGED ="campaignAndStrategyChanged";
    this.EVENT_BRAND_CHANGED_FROM_DASHBOARD = "brandChangedFromDashboard";
    this.EVENT_KPI_CHANGED = "EVENT_KPI_CHANGED" ;
    this.NAVIGATION_TO_OPTIMIZATION_TAB = "navigationToOptimizationTab" ;
    this.EVENT_TIMEPERIOD_CHANGED = "timePeriodChanged";
    this.EVENT_ACTION_CREATED = "actionCreated";
    this.NAVIGATION_FROM_CAMPAIGNS = "navigationFromCampaigns";
    this.BUBBLE_BRAND_CLICKED = "bubbleBrandClicked";
    this.EVENT_STATUS_FILTER_CHANGED = "statusFilterChanged";
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
    this.GA_PERF_PLATFORMS = 'performance_platforms_selected';
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
    this.FORMATS = "Formats";

    this.DEFAULT_LIMIT_COUNT = 100;
    this.DEFAULT_OFFSET_START = 0;
    this.DATA_NOT_AVAILABLE= 204;

    this.MSG_METRICS_NOT_TRACKED= "<span class='no-data-common'>Metric not tracked <span class='contact_note'>Please contact your Account Manager</span></span>";
    this.MSG_UNKNOWN_ERROR_OCCURED="<div class='no-data-common'>Data not available <div>Please retry later</div><span class='reload-img'></span></div>";
    this.MSG_DATA_NOT_AVAILABLE= "<span class='no-data-common'>Data not available</span>";
    this.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD= "<span class='data_not_found'>Data not available</span>";
    this.MSG_CAMPAIGN_YET_TO_START= "<span class='no-data-common'>Campaign yet to start</span>";
    this.MSG_STRATEGY_YET_TO_START= "<span class='no-data-common'>Strategy yet to start</span>";
    this.MSG_TACTIC_YET_TO_START= "<span class='no-data-common'>Tactic yet to start</span>";
    this.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Campaign is active, data not yet available</span>";
    this.MSG_STRATEGY_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Strategy is active, data not yet available</span>";
    this.MSG_TACTIC_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Tactic is active, data not yet available</span>";
    this.MSG_CAMPAIGN_VERY_OLD = "<span class='no-data-common'>Campaign ended 3+ years ago, data not available</span>";
    this.MSG_STRATEGY_VERY_OLD = "<span class='no-data-common'>Strategy ended 3+ years ago, data not available</span>";
    this.MSG_TACTIC_VERY_OLD = "<span class='no-data-common'>Tactic ended 3+ years ago, data not available</span>";
    this.MSG_CAMPAIGN_KPI_NOT_SET = "<span class='no-data-common'>Campaign KPI is not set</span>";
    this.MSG_STRATEGY_KPI_NOT_SET = "<span class='no-data-common'>Strategy KPI is not set</span>";
    this.MSG_TACTIC_KPI_NOT_SET = "<span class='no-data-common'>Tactic KPI is not set</span>";
    this.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Campaign yet to be optimized</span>";
    this.MSG_CAMPAIGN_NOT_OPTIMIZED = "<span class='no-data-common'>Campaign is not optimized</span>";
    this.MSG_STRATEGY_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Strategy yet to be optimized</span>";
    this.MSG_NO_CAMPAIGNS_WITH_SET_KPI = "<span class='data_not_found'>No Campaigns with set KPI value</span>";
    this.DATA_NOT_AVAILABLE_STYLE = "data_not_found";
    this.ALL_STRATEGIES_OBJECT={'name': 'All Strategies', id : 0, type : 'all'};


  };

  commonModule.service("constants", constants);

}());
