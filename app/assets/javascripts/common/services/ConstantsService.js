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
    this.VTC = "VTC";
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
    this.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
    this.MSG_CAMPAIGN_NOT_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
    this.MSG_STRATEGY_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
    this.MSG_NO_CAMPAIGNS_WITH_SET_KPI = "<span class='data_not_found'>No Campaigns with set KPI value</span>";
    this.DATA_NOT_AVAILABLE_STYLE = "data_not_found";
    this.ALL_STRATEGIES_OBJECT={'name': 'All Strategies', id : 0, type : 'all'};

    this.NO_RELEVANT_CAMPAIGNS = "No Relevant Campaigns";
    this.COST_BREAKDOWN = "Cost Breakdown";
    this.PERFORMANCE = "Performance";
    this.BUDGET = "Budget";
    this.BRAND = "Brand";
    this.CAMPAIGN_ON_TRACK = "Campaign On Track";
    this.UNDERPERFORMING_CAMPAIGN = "Underperforming Campaign";
    this.NEUTRAL = "Neutral (no status)";
    this.IMP_WITH_DOT = "Imps.";
    this.VTC = "VTC";
    this.QUARTILE_DETAILS = "Quartile Details";
    this.YET_TO_START = "Yet to start";
    this.ENDED = "Ended";
    this.DAYS_LEFT = "Days Left";
    this.STARTED_TODAY = "Started today";
    this.ENDING_TODAY = "Ending today";
    this.VIEW_REPORT = "View Report";
    this.ACTIVITY = "Activity";
    this.BUDGET_WITH_COLON = "Budget:";
    this.CUMULATIVE_VALUE = "Cumulative Value";
    this.ACTION_RATE_R_CAPS = "Action Rate";

    this.SELECT_ALL = "Select All";
    this.DRAFT = "Draft";
    this.READY = "Ready";
    this.ACTIVE_LABEL = "Active";
    this.KPI_ON_TRACK = "KPI On Track";
    this.UNDERPERFORMING = "Underperforming";
    this.PAUSED = "Paused";
    this.COMPLETED = "Completed";

    this.CREATE_ACTIVITY = "Create Activity";
    this.ACTIVITY_CREATED_SUCCESSFULLY_VIEW_ACTIVITY_LOG = "Activity created successfully. Please see activity log below!";
    this.SELECT_ITEM_IN_LIST  =  "Please select an item in the list.";
    this.EXTERNAL = "External";
    this.PLEASE_FILL_OUT_FIELD = "Please fill out this field.";
    this.EDIT_ACTIVITY = "Edit Activity";
    this.IMPACTS = "Impacts";
    this.CANCEL = "Cancel";
    this.CAMPAIGN_PERFORMANCE = "Campaign Performance";
    this.INTERNAL = "Internal";
    this.ACTIVITY_LOG = "Activity Log";
    this.CLICK_FOR_DETAILED_REPORTS = "Click for detailed reports";
    this.SCREENS = "Screens";
    this.PLATFORM = "Platforms";
    this.TOP_THREE = "Top 3";
    this.VIEWABILITY = "Viewability";
    this.INVENTORY = "Inventory";
    this.TOP = "Top";
    this.NO_LINKED_STRATEGIES = "No Linked Strategies";
    this.ALL = "All";
    this.ONE_S= "1s";
    this.FIVE_S= "5s";
    this.FIFTEEN_S= "15s";
    this.CAMPAIGN_OVERVIEW = "Campaign Overview";
    this.KPI = "KPI";
    this.DATA = "Data";
    this.AD_SERVING = "Ad Serving";
    this.CREATIVE = "Creative";
    this.RESEARCH = "Research";
    this.AD_VERIFICATION = "Ad Verification";
    this.COLLECTIVE = "Collective";
    this.TRANSPARENT_PLATFORM_FEE_CHARGED = "Transparent platform fee charged by Collective for technology and services associated with programmatic media activity";
    this.TOTAL_SPEND = "Total Spend";

    this.CAMPAIGN ="Campaign";

    this.FLIGHT_DATES = "Flight Dates";
    this.METRICS_LIFE_TIME = "Metrics (Lifetime)";
    this.METRICS = "Metrics";
    this.LOAD_MORE_STRATEGIES = "Load More Strategies";
    this.LOAD_MORE_TACTICS = "Load More Tactics";

    this.STATUS = "Status";
    this.CALENDAR = "Calendar";
    this.MOST_RELEVANT_CAMPAIGN = "Most Relevant Campaigns";
    this.CAMPAIGN_STATUS = "Campaign Status";
    this.PERFORMANCE_STATUS = "Performance Status";
    this.ON_TRACK = "On Track";
    this.END_DATES = "End Dates";
    this.SORT_BY = "Sort by";
    this.WEEK = "Week";
    this.MONTH = "Month";
    this.QUARTER = "Quarter";
    this.YEAR = "Year";

    this.DASHBOARD = "Dashboard";
    this.CAMPAIGNS = "Campaigns";
    this.REPORTS = "Reports";
    this.HELLO = "Hello";
    this.ABOUT = "About";
    this.LOGOUT = "Log out";

    this.CATEGORIES = "Categories";
    this.DOMAINS = "Domains";
    this.URLS = "URLs";
    this.DELIVERED = "Delivered";
    this.INSUFFICIENT_DATA_POINTS_TO_RENDER_GRAPH = "Insufficient data points to render graph";

    this.SEE_DATES = "See Dates";
    this.BEFORE = "Before";
    this.AFTER = "After";
    this.OPTIMIZATION_TYPE = "Optimization Type";
    this.DATE_OPTIMIZED = "Date Optimized";
    this.METRIC = "Metric";
    this.DATE_FROM = "Date from";
    this.DATE_TO = "Date to";
    this.VALUE = "Value";
    this.BEFORE_VALUE = "Before Value";
    this.AFTER_VALUE = "After Value";
    this.CHANGE_IN_PERCENTAGE = "Change %";

    this.DAYS_OF_WEEK = "Days of Week";

    this.COST = "Cost";
    this.BASED_ONLY_ON_MEASURABLE_IMPS ="Based only on Measurable Imps";
    this.VIEWABLE = "Viewable";
    this.MEASURABLE = "Measurable";
    this.SUSPICIOUS_ACTIVITY = "Suspicious Activity";

    this.STRATEGY = "Strategy";

    this.PLATFORM_NAME = "Platform Name";

    this.SUSPICIOUS = "Suspicious";
    this.TOTAL = "Total";

    this.SCREEN = "Screen";
    this.SELECT_ALL_SMALL_A = "Select all";

    this.FORGOT_PASSWORD = "Forgot Password";
    this.FORGOT_PASSWORD_CONTACT_ACCOUNT_MANAGER = 'Contact your Account Manager to reset your password';
    this.COPY_RIGHTS = "Copyright &copy; 2015 Collective, Inc. All Rights Reserved";
    this.ABOUT_US = "About Us";
    this.USERNAME_OR_PASSWORD_INCORRECT = "The Username/Password is incorrect";

    this.CAPAIGN_DETAILS = "Campaign Details";
    this.FORMAT = "Format";
    this.DOWNLOAD_REPORT = "Download Report";
    this.DOWNLOADING = "Downloading";

    this.DAY_OF_WEEK = "Day of Week";
    this.PRIMARY_KPI = "Primary KPI";

    this.CATEGORIZED_DATA_TOOLTIP = "% computed from categorized data only. Screen categorization of media started in March 2014, hence data prior to that is uncategorized";

    this.KPI_ON_TARGET = "KPI on target";
    this.KPI_UNDERPERFORMANCE = "KPI Underperformance";
    this.GRAPH_REPRESENTS_CAMPAIGNS_WHICH_HAVE_SET_KPI_VALUES_ONLY = "Graph represents campaigns which have set KPI values only";
    this.VIDEO = "Video";
    this.PLAYS = "plays";
    this.PRICING_METHOD_CPM = "cpm";
    this.PRICING_METHOD_MARKUP = "markup";
    this.SYMBOL_PERCENT = "%";
    this.SYMBOL_DOLLAR = "$";

    this.QUARTILE_DATA = "Quartile Data";
  };

  commonModule.service("constants", constants);

}());
