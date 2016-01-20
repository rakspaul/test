(function() {
    var constants = function ($locale) {
        this.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
        this.CAMPAIGN_LIST_CANCELLER = 1;
        this.CAMPAIGN_FILTER_CANCELLER = 1;
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
        this.NEW_REPORT_RESULT_CANCELLER = 3;
        this.PERIOD_LIFE_TIME = 'life_time';
        this.PERIOD_LAST_7_DAYS = 'last_7_days';
        this.PERIOD_LAST_30_DAYS = 'last_30_days';
        this.SORT_DESC = 'desc';
        this.ACTIVE_UNDERPERFORMING = 'underperforming';
        this.ACTIVE_ONTRACK = 'ontrack';
        this.DRAFT_CONDITION = 'draft';
        this.READY_CONDITION = 'scheduled';
        this.ACTIVE_CONDITION = 'in_flight';
        this.COMPLETED_CONDITION = 'ended';
        this.PAUSED_CONDITION = 'paused';
        this.ENDING_SOON_CONDITION = 'endingSoon';
        this.ARCHIVED_CONDITION = 'archived';
        this.REPORTS_OVERVIEW = 'Reports Overview';

        this.ONTRACK = 'ontrack';
        this.UNDERPERFORMING = 'underperforming';
        this.ENDING_SOON = 'Ending Soon';
        this.ACTIVE = 'active';
        this.DASHBOARD_STATUS_ACTIVE = "Active";
        this.DASHBOARD_STATUS_COMPLETED = "Completed";
        this.DASHBOARD_STATUS_ALL = "All";
        this.ALL_BRANDS = 'All Brands';
        this.ALL_ADVERTISERS = 'All Advertisers';
        this.EVENT_BRAND_CHANGED = "brandChanged";
        this.EVENT_ADVERTISER_CHANGED = "advertiserChanged";
        this.EVENT_CAMPAIGN_CHANGED = "campaignChanged";
        this.EVENT_STRATEGY_CHANGED = "strategyChanged" ;
        this.EVENT_CAMPAIGN_STRATEGY_CHANGED ="campaignAndStrategyChanged";
        this.EVENT_BRAND_CHANGED_FROM_DASHBOARD = "brandChangedFromDashboard";
        this.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD = "advertiserChangedFromDashboard";
        this.EVENT_ADVERTISER_CHANGED_FROM_CLIENT_CHANGE = 'advertiserChangesFromClientChange';
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
        this.PLATFORMS = "Platforms";
        this.CREATIVES = "Creatives";
        this.VIDEO_PLAYS = "Video Plays";
        this.AD_SIZES = "Ad Sizes";

        this.COLLECTIVE_INSIGHTS = "Collective Insights";
        this.UPLOAD_REPORT = "Upload Report";
        this.REPORT_LABEL ='Report';
        this.SCHEDULED_REPORTS = "Scheduled Reports";
        this.SCHEDULE_LABEL = 'Schedule';
        this.GENERATE_LABEL ='Generate'
        this.RESET_LABEL ='Reset'
        this.SET_SCHEDULE = 'Set Schedule';
        this.NEW_REPORT = "New Report";
        this.SCHEDULE_DELIVER_ON = 'Deliver on';
        this.SCHEDULE_OCCURS_ON= 'Occurs on';
        this.WEEKNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.SCHEDULE_REPORT_OCCURS_ON_LIST = ['Start of Month', 'Middle of Month(15th)', 'End of Month', 'Custom'];
        this.SELECT_DATE_LABEL = 'Select a date';
        this.SCHEDULE_START_DATE_LABEL ='Starts on';
        this.SCHEDULE_END_DATE_LABEL ='Ends on';
        this.SCHEDULER_UPDATE = 'Do you want to update the Schedule report ?';
        this.REPORT_BUILDER_TIMEFRAME ='Timeframe';
        this.REPORT_CHOOSE_BREAKDOWN = "Choose Breakdown";
        this.REPORT_ADDITIONAL_FILTERS = "Additional Filters";
        this.REPORT_ADD_FILTERS = "Add Filters";
        this.REPORT_BUILDER_TIMEFRAME_LIST = ['Yesterday', 'Week to date', 'Last 7 days', 'Last week', 'Month to date', 'Last month', 'Quarter to date', 'Last quarter', 'Year to date', 'Custom dates'];
        this.AD_CREATED_SUCCESS = '<span class="bold-font">Success. </span> Ad has been successfully created';
        this.CAMPAIGN_CREATED_SUCCESS = '<span class="bold-font">Success. </span> Media Plan has been successfully created';
        this.CAMPAIGN_UPDATED_SUCCESS ='<span class="bold-font">Success. </span> Media Plan has been successfully updated';
        this.PARTIAL_AD_SAVE_FAILURE = '<span class="bold-font">Error. </span> Ad could not be created' ;
        this.PARTIAL_AD_SAVE_SUCCESS = '<span class="bold-font">Success. </span> Ad has been successfully saved';
        this.AD_GROUP_CREATED_SUCCESS = '<span class="bold-font">Success. </span> Ad Group has been successfully created';
        this.AD_GROUP_CREATED_FAILURE = '<span class="bold-font">Error. </span> Ad Group could not be created';
        this.CREATIVE_SAVE_SUCCESS = '<span class="bold-font">Success. </span> Creative has been successfully created';
        this.WF_DATE_FORMAT='YYYY-MM-DD HH:mm:ss.SSS';
        this.TOTAL_BUDGET_REQUIRED='You must enter Total Budget.'
        this.VENDOR_ID_REQUIRED='You must select a vendor.'
        this.TOTAL_BUDGET_GREATER_THAN_ZERO='You must Total Budget greater than 0.'
        this.NON_INVENTORY_COST_GREATER_THAN_ZERO='Cost exceeds budget.'
        this.DELIVERY_BUDGET_GREATER_THAN_ZERO='Delivery budget can not be negative.'
        this.DELIVERY_BUDGET_BOOKEDSPEND='Delivery budget should be greater than or equal to the sum of ad budgets '
        this.STARTDATE_REQUIRED='Please select the start Date.'
        this.ADD_COST='Would you like to add Costs?'
        this.SELECT_MANY='Select as many as you require'
        this.SELECT_ONE='Select One'
        this.ENTER_VALUE='Enter Value'
        this.VALUE_IN_REPORTING='Value appears in reporting'
        this.ONE_PRIMARY='Only one is primary'
        this.KPI_BILLING='Select a KPI for billing'
        this.SELECT_ONE_YOU_MAY_ADD='Select one-you may add'
        this.SELECT_KPIS='Select KPIs '

        this.DEFAULT_LIMIT_COUNT = 100;
        this.DEFAULT_OFFSET_START = 0;
        this.DATA_NOT_AVAILABLE= 204;

        this.MSG_METRICS_NOT_TRACKED= "<span class='no-data-common'>Metric not tracked <span class='contact_note'>Please contact your Account Manager</span></span>";
        this.MSG_UNKNOWN_ERROR_OCCURED="<div class='no-data-common'>Data not available <div>Please retry later</div><span class='reload-img'></span></div>";
        this.MSG_DATA_NOT_AVAILABLE= "<span class='no-data-common'>Data not available</span>";
        this.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD= "<span class='data_not_found'>Data not available</span>";
        this.MSG_CAMPAIGN_YET_TO_START= "<span class='no-data-common'>Media Plan yet to start</span>";
        this.MSG_STRATEGY_YET_TO_START= "<span class='no-data-common'>Ad Group yet to start</span>";
        this.MSG_TACTIC_YET_TO_START= "<span class='no-data-common'>Ad yet to start</span>";
        this.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Media Plan is active, data not yet available</span>";
        this.MSG_STRATEGY_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Ad Group is active, data not yet available</span>";
        this.MSG_TACTIC_ACTIVE_BUT_NO_DATA = "<span class='no-data-common'>Ad is active, data not yet available</span>";
        this.MSG_CAMPAIGN_VERY_OLD = "<span class='no-data-common'>Media Plan ended 3+ years ago, data not available</span>";
        this.MSG_STRATEGY_VERY_OLD = "<span class='no-data-common'>Ad Group ended 3+ years ago, data not available</span>";
        this.MSG_TACTIC_VERY_OLD = "<span class='no-data-common'>Ad ended 3+ years ago, data not available</span>";
        this.MSG_CAMPAIGN_KPI_NOT_SET = "<span class='no-data-common'>Media Plan KPI is not set</span>";
        this.MSG_STRATEGY_KPI_NOT_SET = "<span class='no-data-common'>Ad Group KPI is not set</span>";
        this.MSG_TACTIC_KPI_NOT_SET = "<span class='no-data-common'>Ad KPI is not set</span>";
        this.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
        this.MSG_CAMPAIGN_NOT_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
        this.MSG_STRATEGY_YET_TO_BE_OPTIMIZED = "<span class='no-data-common'>Optimization activity not recorded</span>";
        this.MSG_NO_CAMPAIGNS_WITH_SET_KPI = "<span class='data_not_found'>No Media Plan with set KPI value</span>";
        this.DATA_NOT_AVAILABLE_STYLE = "data_not_found";
        this.ALL_STRATEGIES_OBJECT={'name': 'All Ad Groups', id : -1, type : 'all'};
        this.NO_ADGROUPS_FOUND= 'No Adgroups Found';

        this.NO_RELEVANT_CAMPAIGNS = "No Relevant Media Plans";
        this.COST_BREAKDOWN = "Cost Breakdown";
        this.PERFORMANCE = "Performance";
        this.BUDGET = "Budget";
        this.BRAND = "Brand";
        this.CAMPAIGN_ON_TRACK = "Media Plan On Track";
        this.UNDERPERFORMING_CAMPAIGN = "Underperforming Media Plan";
        this.NEUTRAL = "Neutral (no status)";
        this.IMP_WITH_DOT = "Imps.";
        this.VTC = "VTC";
        this.QUARTILE_DETAILS = "Quartile Details";
        this.YET_TO_START = "Yet to start";
        this.ENDED = "Ended";
        this.ARCHIVED = "Archived";
        this.DAYS_LEFT = "Days Left";
        this.STARTED_TODAY = "Started today";
        this.ENDING_TODAY = "Ending today";
        this.VIEW_REPORT = "View Reports";
        this.ACTIVITY = "Activity";
        this.MANAGE = "Manage";
        this.BUDGET_WITH_COLON = "Budget:";
        this.CUMULATIVE_VALUE = "Cumulative Value";
        this.ACTION_RATE_R_CAPS = "Action Rate";

        this.SELECT_ALL = "Select All";
        this.DRAFT = "Draft";
        this.READY = "Ready";
        this.SCHEDULED = "Scheduled";
        this.INFLIGHT_LABEL = "In Flight";
        this.ACTIVE_LABEL = "Active";
        this.KPI_ON_TRACK = "KPI On Track";
        this.UNDERPERFORMING = "Underperforming";
        this.PAUSED = "Paused";
        this.COMPLETED = "Completed";
        this.ENDED = "Ended";

        this.CREATE_ACTIVITY = "Create Activity";
        this.ACTIVITY_CREATED_SUCCESSFULLY_VIEW_ACTIVITY_LOG = "Activity created successfully. Please see activity log below!";
        this.SELECT_ITEM_IN_LIST  =  "Please select an item in the list.";
        this.EXTERNAL = "External";
        this.PLEASE_FILL_OUT_FIELD = "Please fill out this field.";
        this.EDIT_ACTIVITY = "Edit Activity";
        this.IMPACTS = "Impacts";
        this.CANCEL = "Cancel";
        this.CAMPAIGN_PERFORMANCE = "Media Plan Performance";
        this.INTERNAL = "Internal";
        this.ACTIVITY_LOG = "Activity Log";
        this.CLICK_FOR_DETAILED_REPORTS = "Click for detailed reports";
        this.SCREENS = "Screens";
        this.PLATFORM = "Platforms";
        this.TOP_THREE = "Top 3";
        this.QUALITY = "Quality";
        this.VIEWABILITY = 'Viewability';
        this.INVENTORY = "Inventory";
        this.AD_SIZE = "Ad Size";

        this.TOP = "Top";
        this.NO_LINKED_STRATEGIES = "No Linked Ad Groups";
        this.ALL = "All";
        this.ONE_S= "1s";
        this.FIVE_S= "5s";
        this.FIFTEEN_S= "15s";
        this.CAMPAIGN_OVERVIEW = "Media Plan Overview";
        this.KPI = "KPI";
        this.DATA = "Data";
        this.AD_SERVING = "Ad Serving";
        this.AD_START_IMPS = "Ad Start Imps.";
        this.CREATIVE = "Creative";
        this.RESEARCH = "Research";
        this.AD_VERIFICATION = "Ad Verification";
        this.COLLECTIVE = "Collective";
        this.TRANSPARENT_PLATFORM_FEE_CHARGED = "Transparent platform fee charged by Collective for technology and services associated with programmatic media activity";
        this.TOTAL_SPEND = "Total Spend";

        this.CAMPAIGN ="Media Plan";

        this.FLIGHT_DATES = "Flight Dates";
        this.METRICS_LIFE_TIME = "Metrics (Lifetime)";
        this.METRICS = "Metrics";
        this.LOAD_MORE_STRATEGIES = "Load More Ad Groups";
        this.LOAD_MORE_TACTICS = "Load More Ads";

        this.STATUS = "Status";
        this.CALENDAR = "Calendar";
        this.MOST_RELEVANT_CAMPAIGN = "Most Relevant Media Plans";
        this.CAMPAIGN_STATUS = "Media Plan Status";
        this.PERFORMANCE_STATUS = "Performance Status";
        this.ON_TRACK = "On Track";
        this.END_DATES = "End Dates";
        this.SORT_BY = "Sort by";
        this.WEEK = "Week";
        this.MONTH = "Month";
        this.QUARTER = "Quarter";
        this.YEAR = "Year";

        this.DASHBOARD = "Dashboard";
        this.CAMPAIGNS = this.MEDIA_PLAN = "Media Plans";
        this.CREATE_CAMPAIGN =  "Create Media Plan";
        this.REPORTS = "Reports";
        this.HELLO = "Hello";
        this.ABOUT = "About";
        this.LOGOUT = "Log Out";

        this.CATEGORIES = "Categories";
        this.DOMAINS = "Domains";
        this.DELIVERED = "Delivered";
        this.DELIVERED_IMPS = "Delivered Imps";
        this.VIEW_MODE = "Media Type";
        this.VIDEO_PLAYS = "Video Plays";
        this.VIDEO_VIEWS = "Video Views";
        this.MEASURED_AS_HUNDRED_PERCENT_VIDEO_PLAYED_DIVIDED_BY_AD_START = "Measured as 100% Video played divided by Ad start " ;
        this.VIDEO_PLAY_COMPLETION_AND_VIDEO_VIEWABILITY_AT_THE_VARIOUS_QUARTILES_OF_THE_AD = "Video Viewability at various quartiles of the Ad";
        this.INSUFFICIENT_DATA_POINTS_TO_RENDER_GRAPH = "Insufficient data points to render graph";
        this.VIDEO_VIEWABILITY = "Video Viewability" ;
        this.VIEWABLE_IMPS = "Viewable Imps." ;

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
        this.BASED_ONLY_ON_VIEWABLE_IMPS ="Based only on Viewable Imps";
        this.VIEWABLE = "Viewable";
        this.MEASURABLE = "Measurable";
        this.SUSPICIOUS_ACTIVITY = "Suspicious Activity";

        this.SSL_ERROR_MESSAGE = "Please enter a SSL compatible tag.";

        this.STRATEGY = "Ad Group";

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

        this.CAPAIGN_DETAILS = "Media Plan Details";
        this.FORMAT = "Format";
        this.DOWNLOAD_REPORT = "Download Report";
        this.DOWNLOADING = "Downloading";

        this.DAY_OF_WEEK = "Day of Week";
        this.PRIMARY_KPI = "Primary KPI";

        this.CATEGORIZED_DATA_TOOLTIP = "% computed from categorized data only. Screen categorization of media started in March 2014, hence data prior to that is uncategorized";

        this.TARGET_ZONE = "Target Zone";
        this.KPI_ON_TARGET = "KPI on target";
        this.KPI_UNDERPERFORMANCE = "KPI Underperformance";
        this.GRAPH_REPRESENTS_CAMPAIGNS_WHICH_HAVE_SET_KPI_VALUES_ONLY = "% of Performing Media Plan measured against the set KPI or delivery if no KPI is set.";
        this.VIDEO = "Video";
        this.PLAYS = "plays";
        this.PRICING_METHOD_CPM = "cpm";
        this.PRICING_METHOD_MARKUP = "markup";
        this.SYMBOL_PERCENT = "%";
        this.SYMBOL_DOLLAR = "$";

        this.QUARTILE_DATA = "Quartile Data";

        //workflow related variables
        this.WF_CREATE_CAMPAIGN = "Media Plan Setup";

        this.UPLOAD_TEMPLATE = "Upload Template";
        this.CREATE = "Create";
        this.WF_SETTINGS = "Settings";
        this.ACCOUNT = "Account";
        this.WF_BRAND = "Brands";
        this.ADVERTISERS = "Advertiser";
        this.SELECT_ACCOUNT = "Select Account";
        this.WF_GOAL = "Goal";
        this.SELECT_GOAL = "Select Goal";
        this.BUDGET = "Budget";
        this.START_DATE = "Start Date";
        this.END_DATE = "End Date";
        this.SELECT_TIME = "Select Time";
        this.ADS = "Ads";
        this.UNTITLED_CAMPAIGN = "Untitled Media Plan";
        this.SAVE_CAMPAIGN = "Save Media Plan";
        this.PUSH_CAMPAIGN = "Push Media Plan";
        this.CANCEL = "Cancel";
        this.GROUP_TITLE = "Group Title";
        this.EDIT = "Edit";
        this.DFP_DISPLAY = "DFP Display";
        this.DFP_PRE_ROLL = "DFP Pre-roll";
        this.DRAFT = "Draft";
        this.READY = "Ready";
        this.IMPRESSIONS = "Impressions";
        this.CREATIVES = "Creatives";
        this.TARGETING = "Targeting";
        this.CONTINUE = "Continue";
        this.PREVIOUS = "Previous";
        this.NEXT = "Next";

        this.WF_GUIDED_COPY ="Guided Copy Here - What should i choose?";
        this.WF_HEADER_CREATIVES ="What type of creatives are you using?";
        this.WF_AD_FORMAT = "Ad Format";
        this.WF_DISPLAY = "Display";
        this.WF_VIDEO = "Video";
        this.WF_RICH_MEDIA = "Rich Media";
        this.WF_SOCIAL = "Social";
        this.WF_HEADER_PRIMARY_GOAL = "What is your primary goal?";
        this.WF_AD_GOAL = "Ad Goal";
        this.WF_PERFORMANCE = "Performance";
        this.WF_BRAND = "Brand";
        this.WF_HEADER_AD_OBJECTIVE = "What is your Ad objective?";
        this.WF_PRIMARY_KPI = "Primary KPI";
        this.SELECT_LABEL = "Select One";

        this.WF_HEADER_SCREENS = "What device screens are you targeting?";
        this.WF_SCREEN_TYPE = "Screen Type";
        this.WF_DESKTOP = "Desktop";
        this.WF_MOBILE = "Mobile";
        this.WF_TABLET = "Tablet";
        this.WF_UNTITLED_AD="Untitled Ad";
        this.WF_UNTITLED_MEDIA="Untitled Media Plan";

        this.WF_HEADER_SETTINGS ="Guided Copy Here - Setting up your ad...";
        this.WF_AD_SIZE = "Ad Size";
        this.WF_FLIGHT_DATE = "Flight Date";
        this.WF_IMPRESSIONS = "Impressions";
        this.WF_IMPS = "Imps.";
        this.WF_MEDIA_COST = "Media Cost";
        this.WF_BUDGET = "Budget";
        this.WF_UNIT_COST = "Unit Cost";
        this.WF_PUSH_CAMPAIGN = "Push Media Plan";

        this.WF_HEADER_BUYING_PLATFORM ="Here are the available buying platform based on your goals & ad settings";
        this.WF_HEADER_BUYING_PLATFORM_SUB ="Guided Copy Here - Which platform should i choose?";
        this.WF_COLLECTIVE_MEDIA = "Collective Media";
        this.WF_COLLECTIVE_BIDDER = "Collective Bidder";
        this.WF_APPNEXUS= "Appnexus";
        this.WF_MORE_PLATFORM = "More platform coming soon!";

        this.WF_CHANGE_PLATFORM = "Change Platform";
        this.WF_DELIVERY_PACING = "Delivery Pacing";
        this.WF_HEADER_DELIVERY_FREQUENCY = "Guided Copy Here - Setting up delivery and frequency...";
        this.WF_PRIORITY = "Priority";
        this.WF_DELIVER_IMPRESSIONS = "Deliver Impressions";
        this.WF_FREQUENCY = "Frequency";
        this.WF_FREQUENCY_LIST = ['Once', 'Daily', 'Weekly', 'Monthly'];
        this.WF_SET_FREQUENCY_CAP = "Set per User frequency cap";
        this.WF_IMPRESSION_PER = "Impression per";

        this.YESTERDAY = "Yesterday";
        this.WF_NOT_SET="Not Set";
        this.REPORT_BUILDER = "Report Builder";
        this.CREATED_BY = "Created by";
        this.DISTRIBUTED_TO = "Distributed to";
        this.REPORT_NAME = "Report Name";
        this.ACTIONS = "Actions";
        this.COMPLETE_ON = "Complete on" ;
        this.VIEW_ALL_REPORTS = "View all reports" ;
        this.ADD_BREAKDOWN_LABEL ='Add Breakdown';

        this.WF_CREATIVE_TAG_ALREADY_EXISTS = "This tag already exists in your Creative Tag Library. Save a Creative anyway?";
        this.WF_DUPLICATE_TAG = 'Duplicate Tag';
        this.WF_INVALID_CREATIVE_TAG= 'You have entered an invalid tag. Please review this tag carefully and try again';
        this.WF_INVALID_CREATIVE_TAG_TRACKER="Please include the %%TRACKER%% macro to save the tag";
        this.WF_CREATIVE_TAG_UPDATE_ERROR = 'Unable to update creative';
        this.WF_CREATIVE_FORCESAVE = 'Unable to forceSave creative';
        this.WF_VIEW_TAG_LABEL ='View Tag';
        this.WF_ADD_TARGETING_LABEL ='Add Targeting';
        this.WF_CREATIVE_FORMAT_LABEL ='Creative Format'
        this.WF_MANDATORY_CREATIVE_FORMAT ="Please select the creative format.";
        this.WF_MANDATORY_CREATIVE_NAME = "Please enter a name for the creative."
        this.WF_AD_ARCHIVE_SUCCESS="Ad Archived Successfully"
        this.WF_AD_ARCHIVE_FAILURE="Ad Archive Unsuccessful"
        this.WF_CAMPAIGN_ARCHIVE_SUCCESS="Media Plan Archived Successfully"
        this.WF_CAMPAIGN_ARCHIVE_FAILURE="Media Plan Archive Unsuccessful"
        this.WF_AD_PAUSE_FAILURE="Ad Pause Failed"
        this.WF_AD_PAUSE_SUCCESS="Ad Paused Successfully"
        this.WF_AD_RESUME_FAILURE="Ad Resume Failed"
        this.WF_AD_RESUME_SUCCESS="Ad Resumed Successfully"
        this.WF_AD_PAUSE_MESSAGE="Are you sure you want to pause delivery ?"
        this.WF_AD_UPDATE="AD Update"
        this.WF_PAUSE_AD="Pause AD"
        this.WF_RESUME_AD="Resume AD"
        this.WF_PAUSE="Pause"
        this.WF_RESUME="Resume"
        this.WF_MOVE_TO="Move to"
        this.WF_COPY_TO="Copy to"
        this.WF_ARCHIVE="Archive"
        this.WF_NOT_SET = "Not Set"
        this.WF_AD_SAVE_CLOSE = "Save & Close";
        this.WF_AD_SAVE_CONTINUE = "Save & Continue";
        this.WF_NAME_CAMPAIGN_TXT = "What is the name of your Media Plan?";
        this.WF_ENTER_NAME_CAMPAIGN = "Please enter a name for the Media Plan.";
        this.WF_CAMPAIGN_FOR = "Who is the Media Plan for?";
        this.WF_CAMPAIGN_OBJECTIVES = "Media Plan Objectives";

        this.reportDownloadSuccess = "Report Downloaded Successfully";
        this.reportDownloadFailed = "Report Download Failed";

        this.reportEditSuccess = "Edited Report Successfully";
        this.reportEditFailed = "Edit Report Failed";

        this.reportDeleteSuccess = "Deleted Report Successfully";
        this.reportDeleteFailed = "Deleting Report Failed";
        this.deleteReportHeader = "Delete Report";
        this.accountChangeHeader = "Account Change";
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE = "If you switch accounts, your unsaved ad will be discarded.";
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE = "If you switch accounts, your unsaved media plan will be discarded.";
        this.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE = "Are you sure you want to switch to a different account?";

        this.CAMPAIGN_ARCHIVE_MESSAGES = 'Do you want to Archive / Delete the Media Plan?';

        this.ACCOUNT_CHANGED = "accountChanged";
        this.QUERY_ID_CAMPAIGN_SCREENS=7;
        this.QUERY_ID_CAMPAIGN_FORMATS=8;
        this.QUERY_ID_CAMPAIGN_AD_SIZES=9;
        this.QUERY_ID_CAMPAIGN_COST=14;
        this.QUERY_ID_CAMPAIGN_PLATFORMS=22;
        this.QUERY_ID_CAMPAIGN_INVENTORY_CATEGORIES=25;
        this.QUERY_ID_CAMPAIGN_QUALITY=12;
        this.QUERY_ID_CAMPAIGN_REPORTS_FOR_OPTIMIZATION_IMPACT = 33

        //Create Media Plan
        this.MP_TITLE = "Media Plan Setup";
        this.MP_BUDGET = "Budget";
        this.MP_CONTACTS = "Contacts";
        this.MP_OPTIONAL = "Optional";
        this.MP_SAVE = "Save";
        this.MP_CANCEL = "Cancel";
        this.MP_WHATIS = "What is your Media Plan Objective?";
        this.MP_PRIGOAL = "Primary Goal";
        this.MP_SELGOAL = "Please Select Goal";
        this.MP_PLEASEKPITYPE = "Please select the KPI type.";

        this.WF_MEDIA_COST_LESS_THAN_CAMPAIGN_BUDGET =  "You must enter media cost value less than the budget value specified for the media plan.";
        this.WF_MEDIA_COST_LESS_THAN_MINIMUM_BUDEGT_FOR_AD= "You must enter media cost value less than or equal to the minimum budget value specified for the ad.";
        this.BUDGET_LESS_THAN_AVAILABLE_BUDGET = "You must enter budget less than the available budget";
        this.MIN_BID_SHOULD_LESS_THAN_MAX_BID = "Min bid value should be less than Max bid value";
        this.MAX_BID_SHOULD_GREATER_THAN_MIN_BID = "Max bid value should be greater than Min bid value";

        this.CHANGE_PLATFORM_MESSAGE = "Your entries for the following settings are not compatible with [Platform Name]: [Settings list]. Would you like to clear these settings and switch platforms? (OK/Cancel).";
        this.ARCHIVE_MESSAGE = "Do you want to Archive / Delete the Ad?";

        this.TIMEZONE_UK = 'Europe/London';
        this.TIMEZONE_US = 'America/New_York';
        this.DATE_UK_FORMAT = 'DD/MM/YYYY';
        this.DATE_US_FORMAT = 'MM/DD/YYYY';
        this.DATE_UTC_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
        this.DATE_UTC_SHORT_FORMAT = 'YYYY-MM-DD';

        this.IMPRESSION_PER_USER_MESSAGE = 'you must enter impression per user less than or equal to total ad impression';

        //Ad Create: Header
        this.OBJECTIVES = 'Objectives';
        this.DELBUDGET = 'Delivery Budget';
        this.FLIGHTDATES = 'Flight Dates';
        this.CONTACTS = 'Contacts';
        this.ADGROUPS = 'Ad Groups';
        this.ADS = 'Ads';
        this.CREATIVES = 'Creatives';

        //Ad Create: Sidebar
        this.ADSETUP = 'Ad Setup';
        this.ADTYPESIDE = '1 Ad Type';
        this.NOTSET = 'Not Set';
        this.FORMATPAR = '(Format)';
        this.PRIMARYKPIPAR = '(Primary KPI)';
        this.SCREENPAR = '(Screen)';
        this.BUDGETDELIVERYSIDE = '2 Budget & Delivery';
        this.FLIGHTPAR = '(Flight)';
        this.UNITCOSTPAR = '(Unit Cost)';
        this.BUYINGPLATFORMSIDE = '3 Buying Platform';
        this.PLATFORMPAR = '(Platform)';
        this.TARGETINGSIDE = '4 Targeting';
        this.GEOGRAPHY = 'Geography';
        this.AUDIENCE = 'Audience';
        this.DAYPART = 'Daypart';
        this.INVENTORYSIDE = '5 Inventory Filters';
        this.CREATIVESIDE = '6 Creative';

        //Ad Create: 1 Ad Type
        this.SELECTADTYPE = 'Select Ad Type';
        this.LEARNADTYPES = 'Learn more about Ad Types';
        this.NAMEOFAD = 'What is the name of your Ad?';

        //Ad Create: 2 Budget & Delivery
        this.SETBUDGET = 'Set Budget & Delivery';
        this.LEARNMOREADSET = 'Learn more about Ad Settings';
        this.WHENADRUN = 'When would you like your Ad to run?';
        this.FLIGHTPASSED = 'Campaign flight date has passed';
        this.SETUPBUDGET = 'How do you want to set up the Budget for your Ad?';
        this.UNITCOST = 'Unit Cost';
        this.BUDGETCAL = 'Budget Calculation';
        this.COST = 'Cost';
        this.FREQCAP = 'Frequency Cap';
        this.YES = 'Yes';
        this.NO = 'No';
        this.IMPPERUSER = 'Impressions per user';
        this.DAILY = 'Daily';
        this.LIFETIME = 'Lifetime';
        this.HOWADDEL = 'How should your Ad deliver?';
        this.PACING = 'Pacing';
        this.PACEEVENLY = 'Pace Evenly';
        this.SENDFAST = 'Spend as fast as possible';

        //Ad Create: 3 Buying Platform
        this.SELECTBUYPLAT = 'Select Buying Platform';
        this.FULLINT = 'Full Integrations';
        this.SELECTAPLAT = 'Select a Buying Platform';
        this.SELECTED = 'Selected';
        this.MORESELF = 'More Self Service options coming soon';
        this.CANTFIND = "Can't find what you are looking for?";
        this.TRACKINT = 'Tracking Integrations';
        this.MOREPLATAVAIL = 'More Platforms Available';
        this.CHGPLAT = 'Change Platform?';
        this.OKAY = 'Okay';

        //Ad Create: 4 Targeting
        this.SETTARGETING = 'Set Targeting';
        this.TARGETAUDCHOOSE = 'Which target audience should I choose for my ad?';
        this.ENABLETARGETINGAD = 'To enable Targeting for this ad, you must first set a Buying Platform. Select one now?';
        this.SELECTPLATFORM = 'Select Platform';
        this.AUDSEGMENTS = 'Audience Segments';
        this.REACHAUD = 'Reach the right audience by selecting focus segments';
        this.ALLAUD = 'All Audience (default)';
        this.SELECTED = 'Selected';
        this.TARGETAUDLOC = 'Target your audience by location';
        this.INCLUDED = 'Included';
        this.EXCLUDED = 'Excluded';
        this.DAYPART = 'Daypart';
        this.SELECTADREST = 'Select when to show your Ad by restricting day and time';
        this.ALLDAYSTIMES = 'All Days & Times (default)';
        this.AREYOUSURE = 'Are you sure?';
        this.YES = 'Yes';
        this.NO = 'No';

        //Ad Create: 5 Inventory Filters
        this.SETFILTERS = 'Set Inventory Filters';
        this.HOWMANINVENFILTERS = 'How do I manage my Inventory Filters?';
        this.SELECTEXISTING = 'Select from Existing';
        this.ONLYONELIST = 'Only 1 list is supported at this moment.';
        this.UPLOADDOMAINLIST = 'Upload Domain List';
        this.CSVTXTFILE = '(.csv, .txt file)';
        this.DOMAINLIST = 'Domain List';
        this.DOMAIN = 'Domain';
        this.UPLOADLIST = 'Upload List';
        this.FILENAME = 'File Name';
        this.LISTNAME = 'List Name';
        this.PLEASEENTERLIST = 'Please enter list name.';
        this.CATEGORY = 'Category';
        this.TYPE = 'Type';
        this.WHITELIST = 'Whitelist';
        this.BLACKLIST = 'Blacklist';
        this.LISTYPEMOD = 'List type cannot be modified. ';
        this.IMPORT = 'Import';

        //Ad Create: 6 Creative
        this.ADDCREATIVETAG = 'Add Creative';
        this.ADDINGTHIRD = 'Adding third party Creative Tags';
        this.ADDEXISTNG = 'Add from Existing';
        this.CREATENEW = 'Create New';
        this.DLTRACKER = 'Download Tracker URLs';
        this.SIZE = 'Size';
        this.TAGNAME = 'Creative Name';
        this.TAGTYPE = 'Type';
        this.SSL = 'SSL';
        this.YOUHAVENTADDED = "You haven't added any Creative Tags for your Ad yet";
        this.COPY = "Copy";
        this.DELETE = "Delete";
        this.DOWNLOAD = "Download";
        this.ARCHIEVE = "Archive";
        this.CHOOSE_FILTER = "Choose filter";
        this.SELECT = "Select";

        //User Creation
        this.super_admin = "1";
        this.account_admin = "2";
        this.advertiser_admin = "3";
        this.generic_user = "4";
        this.WF_USER_CREATION_SUCCESS="User Created Successfully"
        this.WF_PERMISSION_NEEDED="Atleast 1 permission needed";
        this.WF_USER_CREATION_FAIL = "Unable to create a User";

        //Overview Page
        this.ADVERTISER = 'Advertiser';
        this.BRAND = 'Brand';
        this.EDIT = 'Edit';
        this.OBJC = 'Objectives';
        this.KPI = 'KPI';
        this.DELBUDGET = 'Delivery Budget';
        this.FLIGHTDATES = 'Flight Dates';
        this.ADGROUPS = 'Ad Groups';
        this.ADS = 'Ads';
        this.CREATIVES = 'Creatives';
        this.SORT = 'Sort';
        this.LATEST = 'Latest';
        this.OLDEST = 'Oldest';
        this.CREATEAD = 'Create Ad';
        this.CREATEADGRP = 'Create Ad Group';
        this.NAMEADGROUP = 'What is the name of your Ad Group?';
        this.ADGROUPNAME = 'Ad Group Name';
        this.ENTERADGRP = 'Please enter a name for the ad group.';
        this.LIKEADSRUN = 'When would you like your Ads to run?';
        this.SELENDDATE = 'Please select the end Date.';
        this.SAVE = 'Save';
        this.CREATEAD = 'Create Ad';
        this.PLATNOTSET = 'Platform Not Set';
        this.NOTPUSHEDPAR = '(NOT PUSHED)';
        this.FLTNOTSET = 'Flight Date Not Set';
        this.AD = 'AD';
        this.PAUSED = 'Paused';
        this.CHOOSEONE = 'Choose One';
        this.BROWSER = 'Browser';
        this.APPS = 'Apps';
        this.NEXT = 'Next';
        this.STEPSETTING = '1. Setting';
        this.STEPBUYINGPLAT = '2. Buying Platform';
        this.STEPTARGETTING = '3. Targetting';
        this.STEPCREATIVES = '4. Creatives';
        this.CCOLBIDDER = 'C Collective Bidder';
        this.BIDSTRATEGY = 'Bidding Strategy';
        this.ADTYPE = 'Ad Type';
        this.SHOWPRESET = 'Show Preset';
        this.PE = 'Pe';
        this.TARGETING = 'Targeting';
        this.KEYVALUE = 'Key Value';
        this.USERPART = 'User Partition';
        this.BUDGERPART = 'Budger Partition';
        this.MINBID = 'Min. Bid';
        this.MAXCOST = 'Max Cost';
        this.MEDIAPLANUPD = 'Media Plan Update';
        this.ARCHIVE = "Archive";
        this.OPTIMIZATION_REPORT = 'Optimization Report';
        this.BUILD_REPORT = 'Build Report';
        this.CUSTOM_REPORTS = 'Custom Reports';
        this.MEDIA_PLAN_REPORTS = 'Media Plan Reports';
        
        //Overview: Create Ad Groups
        this.CREATEADGROUP = 'Create Ad Group';
        this.WHATADGROUPNAME = 'What is your Ad Group name?';
        this.ADGROUPNAME = 'Ad Group Name';
        this.PLEASENAMEADGRP = 'Please enter a name for the ad group.';
        this.WHATFLIGHTDATES = 'What are the Flight Dates?';
        this.PLEASESELSTARTDATE = 'Please select the start Date.';
        
        //Audience Targeting
        this.SAVEAUD = 'Save Audience';
        this.SELSEGMENTS = 'Select Segments';
        this.OPTIONAL = 'Optional';
        this.KEYWORD = 'Keyword';
        this.SOURCE = 'Source';
        this.CLEARALL = 'Clear All';
        this.CATEGORY = 'Category';
        this.SEGMENTNAME = 'Segment Name';
        this.NORESULTSFOUND = ' No Results Found...';
        this.AND = 'And';
        this.OR = 'Or';
        this.IS = 'Is';
        this.ISNOT = 'Is Not';
        this.SELECTED_SEGMENTS = 'Selected Segments';



    };

    commonModule.service("constants", constants);
}());
