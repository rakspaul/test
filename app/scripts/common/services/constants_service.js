define(['angularAMD'], function(angularAMD) {
    angularAMD.service("constants", function($locale) {
        this.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
        this.CAMPAIGN_LIST_CANCELLER = 1;
        this.CAMPAIGN_FILTER_CANCELLER = 1;
        this.ADDLIBRARY_FILTER_CANCELLER = 10;
        this.PLATFORM_TAB_CANCELLER = 99;
        this.COST_CANCELLER = 2;
        this.DASHBOARD_CANCELLER = 3;
        this.GAUGE_CANCELLER = 4;
        this.DASHBOARD_CAMPAIGNS_COUNT_CANCELLER = 5;
        this.SPEND_CHART_CANCELLER = 51;
        this.SCREEN_CHART_CANCELLER = 52;
        this.BUBBLE_CHART_CAMPAIGN_CANCELLER = 53;
        this.INVENTORY_STRATEGY_CANCELLER = 54;
        this.INVENTORY_TACTC_CANCELLER = 55;
        this.STRATEGY_LIST_CANCELLER = 10;
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
        this.ALL_CONDITION = 'all';
        this.REPORTS_OVERVIEW = 'Reports Overview';

        this.ONTRACK = 'ontrack';
        this.UNDERPERFORMING = 'underperforming';
        this.ENDING_SOON = 'Ending Soon';
        this.ACTIVE = 'active';
        this.DASHBOARD_STATUS_IN_FLIGHT = 'In Flight';
        this.DASHBOARD_STATUS_ENDED = 'Ended';
        this.DASHBOARD_STATUS_ALL = 'All';
        this.ALL_BRANDS = 'All Brands';
        this.ALL_ADVERTISERS = 'All Advertisers';
        this.EVENT_BRAND_CHANGED = 'brandChanged';
        this.EVENT_ADVERTISER_CHANGED = 'advertiserChanged';
        this.EVENT_CAMPAIGN_CHANGED = 'campaignChanged';
        this.EVENT_STRATEGY_CHANGED = 'strategyChanged';
        this.EVENT_CAMPAIGN_STRATEGY_CHANGED = 'campaignAndStrategyChanged';
        this.EVENT_BRAND_CHANGED_FROM_DASHBOARD = 'brandChangedFromDashboard';
        this.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD = 'advertiserChangedFromDashboard';
        this.EVENT_ADVERTISER_CHANGED_FROM_CLIENT_CHANGE = 'advertiserChangesFromClientChange';
        this.EVENT_KPI_CHANGED = 'EVENT_KPI_CHANGED';
        this.NAVIGATION_TO_OPTIMIZATION_TAB = 'navigationToOptimizationTab';
        this.EVENT_TIMEPERIOD_CHANGED = 'timePeriodChanged';
        this.EVENT_ACTION_CREATED = 'actionCreated';
        this.NAVIGATION_FROM_CAMPAIGNS = 'navigationFromCampaigns';
        this.BUBBLE_BRAND_CLICKED = 'bubbleBrandClicked';
        this.EVENT_STATUS_FILTER_CHANGED = 'statusFilterChanged';
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
        this.IMPRESSIONS = "Impressions";
        this.CTR = "CTR";
        this.VTC = "VTC";
        this.CPM = "CPM";
        this.ESTREACH = "Estimated Reach";
        this.CPC = "CPC";
        this.CPA = "CPA";
        this.ACTION_RATE = "Action rate";
        this.SCREENS = "Screens";
        this.FORMATS = "Formats";
        this.PLATFORMS = "Platforms";
        this.CREATIVES = "Creatives";
        this.VIDEO_PLAYS = "Video Plays";
        this.AD_SIZES = "Ad Sizes";
        this.DELETE_CREATIVES = "Are you sure you want to delete creatives?"
        this.CPMV = "CPMv";

        this.COLLECTIVE_INSIGHTS = "Collective Insights";
        this.UPLOAD_REPORT = "Upload Report";
        this.REPORT_LABEL ='Report';
        this.ADD_KEYWORDS ='Add Keywords (optional)';
        this.SELECT_DIMENTION ='Select Dimension(s)';
        this.ALL_TYPES ='All Types';
        this.AT_ANY_TIME ='At any time';

        this.SCHEDULED_REPORTS = "My Reports";
        this.REPORT_TYPES = "Report Types";
        this.GENERATED = "Generated";
        this.REPORT_GENERATED = "Report Generated";
        this.DIMENSIONS_FIVE = "Dimensions (select up to 5)";
        this.SCHEDULE_LABEL = 'Schedule';
        this.GENERATE_LABEL ='Generate';
        this.SAVE_LABEL ='Save';
        this.SAVE_PUSH_LABEL ='Save & Push';
        this.RESET_LABEL ='Clear';
        this.SET_SCHEDULE = 'Set Schedule';
        this.SAVE_SCHEDULE = 'Save/Schedule';
        this.NEW_REPORT = 'New Report';
        this.SCHEDULE_DELIVER_ON = 'Deliver on';
        this.SCHEDULE_OCCURS_ON = 'Occurs on';
        this.WEEKNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.SCHEDULE_REPORT_OCCURS_ON_LIST = ['Start of Month', 'Middle of Month(15th)', 'End of Month', 'Custom'];
        this.SELECT_DATE_LABEL = 'Select a date';
        this.SCHEDULE_START_DATE_LABEL = 'Starts on';
        this.SCHEDULE_END_DATE_LABEL = 'Ends on';
        this.SCHEDULER_UPDATE = 'Do you want to update the Schedule report ?';
        this.SAVED_UPDATE = 'Do you want to update the Saved report ?';
        this.REPORT_BUILDER_TIMEFRAME ='Select Timeframe';
        this.SCHEDULE_LIST_REPORT_TYPE = "Report Types";
        this.SCHEDULE_LIST_DATE = "Report Generated";
        this.SCHEDULE_LIST_DIMENSIONS = "Dimensions";
        this.REPORT_CHOOSE_BREAKDOWN = 'Choose Dimension';
        this.REPORT_ADDITIONAL_FILTERS = 'Additional Filters';
        this.REPORT_ADD_FILTERS = 'Add Filters';
        this.REPORT_BUILDER_TIMEFRAME_LIST = [
            'Yesterday',
            'Week to date',
            'Last 7 days',
            'Last week',
            'Month to date',
            'Last month',
            'Quarter to date',
            'Last quarter',
            'Year to date',
            'Custom dates'
        ];
        this.REPORT_LIST_GENERATEON = [
            { key:"Yesterday", value:"Yesterday"},
            { key:"Last7Days", value:"Last 7 days"},
            { key:"Last2Weeks", value:'Last 2 weeks'},
            { key:"LastMonth", value:"Last month"},
            { key:"LastQuater", value:"Last quarter"}
        ];
        this.REPORT_LIST_REPORTTYPES = ['Once', 'Daily', 'Weekly', 'Monthly', 'Saved'];
        this.REPORT_LIST_DIMENSION_COUNT = "Already five dimensions had been selected";
        this.AD_CREATED_SUCCESS = '<span class="bold-font">Success. </span> Ad has been successfully created';
        this.MEDIA_PLAN_DRAFT = ' Save changes to Media Plan set-up?';
        this.MEDIA_PLAN_NOT_DRAFT = 'Save changes to Media Plan set-up and repush to execution <br> platform(s)?';
        this.CAMPAIGN_CREATED_SUCCESS =
            '<span class="bold-font">Success. </span> Media Plan has been successfully created';
        this.CAMPAIGN_UPDATED_SUCCESS =
            '<span class="bold-font">Success. </span> Media Plan has been successfully updated';
        this.PARTIAL_AD_SAVE_FAILURE = '<span class="bold-font">Error. </span> Ad could not be created';
        this.PARTIAL_AD_SAVE_SUCCESS = '<span class="bold-font">Success. </span> Ad has been successfully saved';
        this.PARTIAL_AD_CLONE_SUCCESS = '<span class="bold-font">Success. </span> Ad has been successfully cloned';
        this.AD_GROUP_CREATED_SUCCESS =
            '<span class="bold-font">Success. </span> Ad Group has been successfully created';
        this.AD_GROUP_EDITED_SUCCESS =
            '<span class="bold-font">Success. </span> Ad Group has been successfully edited';
        this.AD_GROUP_CREATED_FAILURE = '<span class="bold-font">Error. </span> Ad Group could not be created';
        this.CREATIVE_SAVE_SUCCESS = '<span class="bold-font">Success. </span> Creative has been successfully created';
        this.WF_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
        this.TOTAL_BUDGET_REQUIRED = 'You must enter Total Budget.';
        this.VENDOR_ID_REQUIRED = 'You must select a vendor.';
        this.TOTAL_BUDGET_GREATER_THAN_ZERO = 'You must Total Budget greater than 0.';
        this.NON_INVENTORY_COST_GREATER_THAN_ZERO = 'Cost exceeds budget.';
        this.DELIVERY_BUDGET_GREATER_THAN_ZERO = 'Delivery budget can not be negative.';
        this.DELIVERY_BUDGET_BOOKEDSPEND = 'Delivery budget should be greater than or equal to the sum of ad budgets ';
        this.STARTDATE_REQUIRED = 'Please select the start Date.';
        this.ADD_COST = 'Would you like to add Costs?';
        this.SELECT_MANY = 'Select as many as you require';
        this.SELECT_ONE = 'Select One';
        this.ENTER_VALUE = 'Enter Value';
        this.VALUE_IN_REPORTING = 'Value appears in reporting';
        this.ONE_PRIMARY = 'Only one is primary';
        this.KPI_BILLING = 'Select a KPI for billing';
        this.SELECT_ONE_YOU_MAY_ADD = 'Select one';
        this.SELECT_KPIS = 'How do you measure success for this Media Plan';
        this.TARGET_GREATER_THAN_ZERO = 'Target should be greater than 0';

        this.DEFAULT_LIMIT_COUNT = 100;
        this.DEFAULT_OFFSET_START = 0;
        this.DATA_NOT_AVAILABLE = 204;

        this.MSG_METRICS_NOT_TRACKED =
            '<span class="no-data-common">Metric not tracked <span class="contact_note">' +
            'Please contact your Account Manager</span></span>';
        this.MSG_UNKNOWN_ERROR_OCCURED =
            '<div class="no-data-common">Data not available <div>Please retry later</div>' +
            '<span class="reload-img"></span></div>';
        this.MSG_DATA_NOT_AVAILABLE = '<span class="no-data-common">Data not available</span>';
        this.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD = '<span class="data_not_found">Data not available</span>';
        this.MSG_CAMPAIGN_YET_TO_START = '<span class="no-data-common">Media Plan yet to start</span>';
        this.MSG_STRATEGY_YET_TO_START = '<span class="no-data-common">Ad Group yet to start</span>';
        this.MSG_TACTIC_YET_TO_START = '<span class="no-data-common">Ad yet to start</span>';
        this.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA =
            '<span class="no-data-common">Media Plan is active, data not yet available</span>';
        this.MSG_STRATEGY_ACTIVE_BUT_NO_DATA =
            '<span class="no-data-common">Ad Group is active, data not yet available</span>';
        this.MSG_TACTIC_ACTIVE_BUT_NO_DATA = '<span class="no-data-common">Ad is active, data not yet available</span>';
        this.MSG_CAMPAIGN_VERY_OLD =
            '<span class="no-data-common">Media Plan ended 3+ years ago, data not available</span>';
        this.MSG_STRATEGY_VERY_OLD =
            '<span class="no-data-common">Ad Group ended 3+ years ago, data not available</span>';
        this.MSG_TACTIC_VERY_OLD = '<span class="no-data-common">Ad ended 3+ years ago, data not available</span>';
        this.MSG_CAMPAIGN_KPI_NOT_SET = '<span class="no-data-common">Media Plan KPI is not set</span>';
        this.MSG_STRATEGY_KPI_NOT_SET = '<span class="no-data-common">Ad Group KPI is not set</span>';
        this.MSG_TACTIC_KPI_NOT_SET = '<span class="no-data-common">Ad KPI is not set</span>';
        this.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED =
            '<span class="no-data-common">Optimization activity not recorded</span>';
        this.MSG_CAMPAIGN_NOT_OPTIMIZED = '<span class="no-data-common">Optimization activity not recorded</span>';
        this.MSG_STRATEGY_YET_TO_BE_OPTIMIZED =
            '<span class="no-data-common">Optimization activity not recorded</span>';
        this.MSG_NO_CAMPAIGNS_WITH_SET_KPI = '<span class="data_not_found">No Media Plan with set KPI value</span>';
        this.DATA_NOT_AVAILABLE_STYLE = 'data_not_found';
        this.ALL_STRATEGIES_OBJECT = {
            'name': 'All Ad Groups',
            id: -1,
            type: 'all'
        };
        this.NO_ADGROUPS_FOUND = 'No Ad Groups Found';
        this.NO_MEDIAPLANS_FOUND = 'No Media Plans Found';

        this.NO_RELEVANT_CAMPAIGNS = 'No Relevant Media Plans';
        this.COST_BREAKDOWN = 'Cost Breakdown';
        this.PERFORMANCE = 'Performance';
        this.MARGIN = 'Margin';
        this.BUDGET = 'Budget';
        this.BRAND = 'Brand';
        this.CAMPAIGN_ON_TRACK = 'Media Plan On Track';
        this.UNDERPERFORMING_CAMPAIGN = 'Underperforming Media Plan';
        this.NEUTRAL = 'Neutral (no status)';
        this.IMP_WITH_DOT = 'Imps.';
        this.VTC = 'VTC';
        this.QUARTILE_DETAILS = 'Quartile Data';
        this.YET_TO_START = 'Yet to start';
        this.ENDED = 'Ended';
        this.ARCHIVED = 'Archived';
        this.ALL = 'All';
        this.DAYS_LEFT = 'Days Left';
        this.STARTED_TODAY = 'Started today';
        this.ENDING_TODAY = 'Ending today';
        this.VIEW_REPORT = 'View Reports';
        this.ACTIVITY = 'Activity';
        this.MANAGE = 'Manage';
        this.BUDGET_WITH_COLON = 'Budget:';
        this.CUMULATIVE_VALUE = 'Cumulative Value';
        this.ACTION_RATE_R_CAPS = 'Action Rate';
        this.TOTAL_AD_BUDGET = 'Total Ad Budget';
        this.ESTIMATED_IMPRESSIONS = 'Estimated Impressions';
        this.KPI_NOTSATISFIED_ERROR = 'Budget and unit cost entered <br>may not satisfy KPI target';

        this.SELECT_ALL = 'Select All';
        this.DRAFT = 'Draft';
        this.READY = 'Ready';
        this.SCHEDULED = 'Scheduled';
        this.INFLIGHT_LABEL = 'In Flight';
        this.ACTIVE_LABEL = 'Active';
        this.KPI_ON_TRACK = 'KPI On Track';
        this.UNDERPERFORMING = 'Underperforming';
        this.PAUSED = 'Paused';
        this.COMPLETED = 'Completed';
        this.ENDED = 'Ended';

        this.CREATE_ACTIVITY = 'Create Activity';
        this.ACTIVITY_CREATED_SUCCESSFULLY_VIEW_ACTIVITY_LOG =
            'Activity created successfully. Please see activity log below!';
        this.SELECT_ITEM_IN_LIST = 'Please select an item in the list.';
        this.EXTERNAL = 'External';
        this.PLEASE_FILL_OUT_FIELD = 'Please fill out this field.';
        this.EDIT_ACTIVITY = 'Edit Activity';
        this.IMPACTS = 'Impacts';
        this.CANCEL = 'Cancel';
        this.CAMPAIGN_PERFORMANCE = 'Media Plan Performance';
        this.INTERNAL = 'Internal';
        this.ACTIVITY_LOG = 'Activity Log';
        this.CLICK_FOR_DETAILED_REPORTS = 'Click for detailed reports';
        this.SCREENS = 'Screens';
        this.PLATFORM = 'Platforms';
        this.TOP_THREE = 'Top 3';
        this.QUALITY = 'Quality';
        this.VIEWABILITY = 'Viewability';
        this.INVENTORY = "Inventory";
        this.AD_SIZE = "Ad Size";

        this.TOP = "Top";
        this.NO_LINKED_STRATEGIES = "No Linked Ad Groups";
        this.ALL = "All";
        this.ONE_S = "1s";
        this.FIVE_S = "5s";
        this.FIFTEEN_S = "15s";
        this.CAMPAIGN_OVERVIEW = "Media Plan Overview";
        this.KPI = "KPI";
        this.DATA = "Data";
        this.AD_SERVING = "Ad Serving";
        this.AD_START_IMPS = "Ad Start Imps.";
        this.CREATIVE = "Creative";
        this.RESEARCH = "Research";
        this.OTHER = "Other";
        this.AD_VERIFICATION = "Ad Verification";
        this.COLLECTIVECOST = "Cost";
        this.TRANSPARENT_PLATFORM_FEE_CHARGED = "Transparent platform fee charged by Collective for technology and services associated with programmatic media activity";
        this.TOTAL_COST = "Total Cost";
        this.TOTAL_MARGIN = "Total Margin";
        this.TOTAL_CLICKS = "Total Clicks";
        this.TOTAL_VIEW = "Total View";
        this.TOTAL_EVENTS = "Total Events";
        this.TOTAL_SPEND = "Total Spend";
        this.CONVERSIONS = "Conversions";
        this.DELIVERY = "Delivery";

        this.CAMPAIGN = "Media Plan";

        this.FLIGHT_DATES = "Flight Dates";
        this.METRICS_LIFE_TIME = "Metrics (Lifetime)";
        this.METRICS = "Metrics";
        this.SELECTED_METRICS = "Selected Metrics";
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
        this.CREATE_CAMPAIGN = "Create";
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
        this.MEASURED_AS_HUNDRED_PERCENT_VIDEO_PLAYED_DIVIDED_BY_AD_START = "Measured as 100% Video played divided by Ad start ";
        this.VIDEO_PLAY_COMPLETION_AND_VIDEO_VIEWABILITY_AT_THE_VARIOUS_QUARTILES_OF_THE_AD = "Video Viewability at various quartiles of the Ad";
        this.INSUFFICIENT_DATA_POINTS_TO_RENDER_GRAPH = "Insufficient data points to render graph";
        this.VIDEO_VIEWABILITY = "Video Viewability";
        this.VIEWABLE_IMPS = "Viewable Imps.";

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
        this.UPLOAD_COMPLETE = "Upload Complete";
        this.DOWNLOAD_ERROR_LOG = "Download Error Log";

        this.DAYS_OF_WEEK = "Days of Week";
        this.DISCREPANCY = "Discrepancy";
        this.COST = "Cost";
        this.BASED_ONLY_ON_MEASURABLE_IMPS = "Based only on Measurable Imps";
        this.BASED_ONLY_ON_VIEWABLE_IMPS = "Based only on Viewable Imps";
        this.VIEWABLE = "Viewable";
        this.MEASURABLE = "Measurable";
        this.SUSPICIOUS_ACTIVITY = "Suspicious Activity";
        this.SSL_ERROR_MESSAGE = "Please enter a SSL compatible tag.";

        this.STRATEGY = "Ad Group";

        this.PLATFORM_NAME = "Platform Name";
        this.COLLECTIVE_FEE = "Collective Fee";

        this.SUSPICIOUS = "Suspicious";
        this.TOTAL = "Total";

        this.SCREEN = "Screen";
        this.SELECT_ALL_SMALL_A = "Select all";

        this.FORGOT_PASSWORD = "Forgot Password";
        this.FORGOT_PASSWORD_CONTACT_ACCOUNT_MANAGER = 'Contact your Account Manager to reset your password';
        this.COPY_RIGHTS = "Copyright &copy; 2016 Collective, Inc. All Rights Reserved";
        this.ABOUT_US = "About Us";
        this.USERNAME_OR_PASSWORD_INCORRECT = "The Username/Password is incorrect";

        this.STRATEGY = 'Ad Group';

        this.PLATFORM_NAME = 'Platform Name';

        this.SUSPICIOUS = 'Suspicious';
        this.TOTAL = 'Total';

        this.SCREEN = 'Screen';
        this.SELECT_ALL_SMALL_A = 'Select all';

        this.FORGOT_PASSWORD = 'Forgot Password';
        this.FORGOT_PASSWORD_CONTACT_ACCOUNT_MANAGER = 'Contact your Account Manager to reset your password';
        this.COPY_RIGHTS = 'Copyright &copy; 2016 Collective, Inc. All Rights Reserved';
        this.ABOUT_US = 'About Us';
        this.USERNAME_OR_PASSWORD_INCORRECT = 'The Username/Password is incorrect';

        this.CAPAIGN_DETAILS = 'Media Plan Details';
        this.CHANNEL = 'Channel';
        this.DOWNLOAD_REPORT = 'Download Report';
        this.DOWNLOADING = 'Downloading';

        this.DAY_OF_WEEK = 'Day of Week';
        this.PRIMARY_KPI = 'Primary KPI';

        this.CATEGORIZED_DATA_TOOLTIP =
            '% computed from categorized data only. Screen categorization of media started in March 2014, ' +
            'hence data prior to that is uncategorized';

        this.TARGET_ZONE = 'Target Zone';
        this.KPI_ON_TARGET = 'KPI on target';
        this.KPI_UNDERPERFORMANCE = 'KPI Underperformance';
        this.GRAPH_REPRESENTS_CAMPAIGNS_WHICH_HAVE_SET_KPI_VALUES_ONLY =
            '% of Performing Media Plan measured against the set KPI or delivery if no KPI is set.';
        this.VIDEO = 'Video';
        this.PLAYS = 'plays';
        this.PRICING_METHOD_CPM = 'cpm';
        this.PRICING_METHOD_MARKUP = 'markup';
        this.SYMBOL_PERCENT = '%';
        this.SYMBOL_DOLLAR = '$';
        this.SYMBOL_HASH = '#';

        this.QUARTILE_DATA = 'Quartile Data';

        //workflow related variables
        this.WF_CREATE_CAMPAIGN = 'Media Plan Setup';
        this.UPLOAD_TEMPLATE = 'Upload Template';
        this.CREATE = 'Create';
        this.BULK_UPLOAD = 'Bulk Upload';
        this.WF_SETTINGS = 'Settings';
        this.ABOUT_THIS_MEDIAPLAN = 'About this Media Plan';
        this.ACCOUNT = 'Account';
        this.WF_BRAND = 'Brands';
        this.ADVERTISERS = 'Advertiser';
        this.SELECT_ACCOUNT = 'Select Account';
        this.WF_GOAL = 'Goal';
        this.SELECT_GOAL = 'Select Goal';
        this.BUDGET = 'Budget';
        this.START_DATE = 'Start Date';
        this.FLIGHT_START_DATE = 'Flight Start Date';
        this.END_DATE = 'End Date';
        this.FLIGHT_END_DATE = 'Flight End Date';
        this.SELECT_TIME = 'Select Time';
        this.ADS = 'Ads';
        this.UNTITLED_CAMPAIGN = 'Untitled Media Plan';
        this.SAVE_CAMPAIGN = 'Save Media Plan';
        this.PUSH_CAMPAIGN = 'Push Media Plan';
        this.CANCEL = 'Cancel';
        this.GROUP_TITLE = 'Group Title';
        this.EDIT = 'Edit';
        this.DFP_DISPLAY = 'DFP Display';
        this.DFP_PRE_ROLL = 'DFP Pre-roll';
        this.DRAFT = 'Draft';
        this.READY = 'Ready';
        this.IMPRESSIONS = 'Impressions';
        this.CREATIVES = 'Creatives';
        this.TARGETING = 'Targeting';
        this.CONTINUE = 'Continue';
        this.PREVIOUS = 'Previous';
        this.NEXT = 'Next';

        this.WF_GUIDED_COPY = 'Guided Copy Here - What should i choose?';
        this.WF_HEADER_CREATIVES = 'What type of creatives are you using?';
        this.WF_AD_FORMAT = 'Ad Format';
        this.WF_CHANNEL = 'Channel';
        this.WF_DISPLAY = 'Display';
        this.WF_VIDEO = 'Video';
        this.WF_RICH_MEDIA = 'Rich Media';
        this.WF_SOCIAL = 'Social';
        this.WF_DISPLAY_SEARCH = 'DISPLAY';
        this.WF_VIDEO_SEARCH = 'VIDEO';
        this.WF_RICH_MEDIA_SEARCH = 'RICHMEDIA';
        this.WF_SOCIAL_SEARCH = 'SOCIAL';
        this.WF_HEADER_PRIMARY_GOAL = 'What is your primary goal?';
        this.WF_AD_GOAL = 'Ad Goal';
        this.WF_PERFORMANCE = 'Performance';
        this.WF_BRAND = 'Brand';
        this.WF_HEADER_AD_OBJECTIVE = 'What is your Ad objective?';
        this.WF_PRIMARY_KPI = 'Primary KPI';
        this.SELECT_LABEL = 'Select One';

        this.WF_HEADER_SCREENS = 'What device screens are you targeting?';
        this.WF_SCREEN_TYPE = 'Screen Type';
        this.WF_DESKTOP = 'Desktop';
        this.WF_MOBILE = 'Mobile';
        this.WF_TABLET = 'Tablet';
        this.WF_UNTITLED_AD = 'Untitled Ad';
        this.WF_UNTITLED_MEDIA = 'Untitled Media Plan';

        this.WF_HEADER_SETTINGS = 'Guided Copy Here - Setting up your ad...';
        this.WF_AD_SIZE = 'Ad Size';
        this.WF_FLIGHT_DATE = 'Flight Date';
        this.WF_IMPRESSIONS = 'Impressions';
        this.WF_IMPS = 'Imps.';
        this.WF_MEDIA_COST = 'Media Cost';
        this.WF_BUDGET = 'Budget';
        this.WF_UNIT_COST = 'Unit Cost';
        this.WF_PUSH_CAMPAIGN = 'Push Media Plan';

        this.WF_HEADER_BUYING_PLATFORM = 'Here are the available buying platform based on your goals & ad settings';
        this.WF_HEADER_BUYING_PLATFORM_SUB = 'Guided Copy Here - Which platform should i choose?';
        this.WF_COLLECTIVE_MEDIA = 'Collective Media';
        this.WF_COLLECTIVE_BIDDER = 'Collective Bidder';
        this.WF_APPNEXUS = 'Appnexus';
        this.WF_MORE_PLATFORM = 'More platform coming soon!';

        this.WF_CHANGE_PLATFORM = 'Change Platform';
        this.WF_DELIVERY_PACING = 'Delivery Pacing';
        this.WF_HEADER_DELIVERY_FREQUENCY = 'Guided Copy Here - Setting up delivery and frequency...';
        this.WF_PRIORITY = 'Priority';
        this.WF_DELIVER_IMPRESSIONS = 'Deliver Impressions';
        this.WF_FREQUENCY = 'Frequency';
        this.WF_FREQUENCY_LIST = ['Once', 'Daily', 'Weekly', 'Monthly'];
        this.WF_SET_FREQUENCY_CAP = 'Set per User frequency cap';
        this.WF_IMPRESSION_PER = 'Impression per';

        this.YESTERDAY = 'Yesterday';
        this.WF_NOT_SET = 'Not Set';
        this.REPORT_BUILDER = 'Report Builder';
        this.REPORT_BUILDER_SUBTITLE = 'Select Dimension(s), Timeframe and any additional parameters to generate your report';
        this.CREATED_BY = 'Created by';
        this.DISTRIBUTED_TO = 'Distributed to';
        this.REPORT_NAME = 'Report Name';
        this.ACTIONS = 'Actions';
        this.COMPLETE_ON = 'Complete on';
        this.VIEW_ALL_REPORTS = 'View all reports';
        this.ADD_BREAKDOWN_LABEL = 'Add Dimension';

        this.WF_CREATIVE_TAG_ALREADY_EXISTS =
            'This tag already exists in your Creative Tag Library. Save a Creative anyway?';
        this.WF_DUPLICATE_TAG = 'Duplicate Tag';
        this.WF_INVALID_CREATIVE_TAG = 'You have entered an invalid tag. Please review this tag carefully and try again';
        this.WF_INVALID_CREATIVE_TAG_TRACKER = 'Please include the %%TRACKER%% macro to save the tag';
        this.WF_CREATIVE_TAG_UPDATE_ERROR = 'Unable to update creative';
        this.WF_CREATIVE_FORCESAVE = 'Unable to forceSave creative';
        this.WF_VIEW_TAG_LABEL = 'View Tag';
        this.WF_ADD_TARGETING_LABEL = 'Add Targeting';
        this.WF_CREATIVE_FORMAT_LABEL = 'Creative Format'
        this.WF_MANDATORY_CREATIVE_FORMAT = "Please select the creative format.";
        this.WF_MANDATORY_CREATIVE_NAME = "Please enter a name for the creative."
        this.WF_AD_ARCHIVE_SUCCESS = "Ad Archived Successfully"
        this.WF_AD_ARCHIVE_FAILURE = "Ad Archive Unsuccessful"
        this.WF_CAMPAIGN_ARCHIVE_SUCCESS = "Media Plan Archived Successfully"
        this.WF_CAMPAIGN_ARCHIVE_FAILURE = "Media Plan Archive Unsuccessful"
        this.WF_AD_PAUSE_FAILURE = "Ad Pause Failed"
        this.WF_AD_PAUSE_SUCCESS = "Ad Paused Successfully"
        this.WF_AD_RESUME_FAILURE = "Ad Resume Failed"
        this.WF_AD_RESUME_SUCCESS = "Ad Resumed Successfully"
        this.WF_AD_PAUSE_MESSAGE = "Are you sure you want to pause delivery ?"
        this.WF_AD_UPDATE = "Ad Update";
        this.WF_PAUSE_AD = "Pause Ad";
        this.WF_RESUME_AD = "Resume Ad";
        this.WF_ARCHIVE_AD = "We're sorry.";
        this.WF_ARCHIVE_CAMPAIGN = "We're sorry.";
        this.WF_REDIRECT_USER_FOR_ARCHIVED_AD = "You are unable to edit this archived Ad. Click 'Continue' to return to Campaign Overview Screen";
        this.WF_REDIRECT_USER_FOR_ARCHIVED_CAMPAIGN = "You are unable to edit this archived Media Plan. Click 'Continue' to return to Media Plan List Screen";
        this.WF_SELECT_MEDIA_PLAN = "Media Plan";
        this.WF_SELECT_AD_GROUP = "Ad Group";
        this.WF_NO_AD_GROUP = "No Ad Group";
        this.WF_CLONE_THIS_AD = "Clone this Ad to";
        this.WF_CLONE_AD = "Clone Ad";
        this.WF_CLONE = "Clone";
        this.WF_PAUSE = "Pause";
        this.WF_RESUME = "Resume";
        this.WF_MOVE_TO = "Move to";
        this.WF_ARCHIVE = "Archive";
        this.WF_NOT_SET = "Not Set";
        this.CLOSE = "Close";
        this.WF_AD_SAVE_CLOSE = "Save & Close";
        this.WF_AD_SAVE_CONTINUE = "Save & Continue";
        this.WF_NAME_CAMPAIGN_TXT = "Tell us about your Media Plan?";
        this.WF_ENTER_NAME_CAMPAIGN = "Please enter a name for the Media Plan.";
        this.WF_CAMPAIGN_FOR = "Who is the Media Plan for?";
        this.WF_CAMPAIGN_OBJECTIVES = "Media Plan Objectives";
        this.WF_PURCHASE_ORDER = "Purchase Order";

        this.reportDownloadSuccess = "Report Downloaded Successfully";
        this.reportDownloadFailed = "Report Download Failed";

        this.reportEditSuccess = "Edited Report Successfully";
        this.reportEditFailed = "Edit Report Failed";

        this.reportDeleteSuccess = "Deleted Report Successfully";
        this.reportDeleteFailed = "Deleting Report Failed";
        this.deleteReportHeader = "Delete Report";
        this.accountChangeHeader = "Account Change";
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE = "Switching accounts will discard any unsaved changes. Do you wish to continue?";
        this.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE = "Switching accounts will reload the page. Do you wish to continue?";
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE = "Switching accounts will discard any unsaved changes. Do you wish to continue?";
        this.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE = "Switching accounts will discard any unsaved changes. Do you wish to continue?";
        this.CAMPAIGN_ARCHIVE_MESSAGES = 'Do you want to Archive / Delete the Media Plan?';
        this.ACCOUNT_CHANGED = 'accountChanged';

        this.QUERY_ID_CAMPAIGN_SCREENS = 7;
        this.QUERY_ID_CAMPAIGN_FORMATS = 8;
        this.QUERY_ID_CAMPAIGN_AD_SIZES = 9;
        this.QUERY_ID_CAMPAIGN_COST = 14;
        this.QUERY_ID_CAMPAIGN_PLATFORMS = 22;
        this.QUERY_ID_CAMPAIGN_INVENTORY_CATEGORIES = 25;
        this.QUERY_ID_CAMPAIGN_QUALITY = 12;
        this.QUERY_ID_CAMPAIGN_REPORTS_FOR_OPTIMIZATION_IMPACT = 33;

        //Create Media Plan
        this.MP_TITLE = 'Media Plan Setup';
        this.MP_BUDGET = 'Budget';
        this.MP_CONTACTS = 'Contacts';
        this.MP_OPTIONAL = 'Optional';
        this.MP_SAVE = 'Save';
        this.MP_CANCEL = 'Cancel';
        this.MP_WHATIS = 'What is your Media Plan Objective?';
        this.MP_PRIGOAL = 'Primary Goal';
        this.MP_SELGOAL = 'Please Select Goal';
        this.MP_PLEASEKPITYPE = 'Please select the KPI type.';

        this.WF_MEDIA_COST_LESS_THAN_CAMPAIGN_BUDGET =
            'You must enter media cost value less than the budget value specified for the media plan.';
        this.WF_MEDIA_COST_LESS_THAN_MINIMUM_BUDEGT_FOR_AD =
            'You must enter media cost value less than or equal to the minimum budget value specified for the ad.';
        this.BUDGET_LESS_THAN_AVAILABLE_BUDGET = 'You must enter budget less than the available budget';
        this.MIN_BID_SHOULD_LESS_THAN_MAX_BID = 'Min bid value should be less than Max bid value';
        this.MAX_BID_SHOULD_GREATER_THAN_MIN_BID = 'Max bid value should be greater than Min bid value';

        this.CHANGE_PLATFORM_MESSAGE =
            'Your entries for the following settings are not compatible with [Platform Name]: [Settings list]. ' +
            'Would you like to clear these settings and switch platforms?.';
        this.ARCHIVE_MESSAGE = 'Do you want to Archive / Delete the Ad?';


        this.TIMEZONE_UK = 'Europe/London';
        this.TIMEZONE_US = 'America/New_York';
        this.DATE_UK_FORMAT = 'DD/MM/YYYY';
        this.DATE_US_FORMAT = 'MM/DD/YYYY';
        this.DATE_UTC_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
        this.DATE_UTC_SHORT_FORMAT = 'YYYY-MM-DD';

        this.IMPRESSION_PER_USER_MESSAGE =
            'you must enter impression per user less than or equal to total ad impression';

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
        this.LABEL = 'Add labels';

        //Ad Create: 2 Budget & Delivery
        this.SETBUDGET = 'Budget & Delivery';
        this.LEARNMOREADSET = 'Learn more about Ad Settings';
        this.WHENADRUN = 'What are your flight and delivery settings?';
        this.FLIGHTPASSED = 'Media Plan flight date has passed';
        this.SETUPBUDGET = 'How do you want to budget your Ad?';
        this.MEASUREBUDGET = 'How will you measure success for your Ad?';
        this.TRACKBUDGET = 'How do you want to track your Ad?';
        this.UNITCOST = 'Unit Cost';
        this.BUDGETCAL = 'Select your Booking Method';
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
        this.SELECTPRIMARYKPI = 'Select Primary KPI';
        this.TARGETVALUE = 'Target Value';
        this.RATE = 'Rate';

        //Ad Create: 3 Buying Platform
        this.SELECTBUYPLAT = 'Select Buying Platform';
        this.FULLINT = 'Full Integrations';
        this.SELECTAPLAT = 'Select a Buying Platform';
        this.SELECTED = 'Selected';
        this.MORESELF = 'More Self Service options coming soon';
        this.CANTFIND = 'Can\'t find what you are looking for?';
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
        this.HOWMANINVENFILTERS = 'Which Inventory Filters should I use?';
        this.SELECTEXISTING = 'Select from Existing';
        this.NO_DOMAIN_LIST_FOUND = 'No domain list found.';
        this.UPLOADDOMAINLIST = 'Upload Domain List';
        this.CSVTXTFILE = '(.csv, .txt file)';
        this.DOMAINLIST = 'Domain List';
        this.DOMAIN = 'Domain';
        this.UPLOAD_BLACK_LIST = 'Upload Blacklist';
        this.UPLOAD_WHITE_LIST = 'Upload Whitelist';
        this.FILENAME = 'File Name';
        this.LISTNAME = 'List Name';
        this.PLEASEENTERLIST = 'Please enter list name.';
        this.CATEGORY = 'Category';
        this.TYPE = 'Type';
        this.WHITELIST = 'Whitelist';
        this.BLACKLIST = 'Blacklist';
        this.LISTYPEMOD = 'List type cannot be modified. ';
        this.IMPORT = 'Import';
        this.INVENTORY_REPLACE_CURRENT_LIST = 'Replace Current List';
        this.INVENTORY_UPLOAD_NEW = 'Upload New';
        this.INVENTORY_SELECTED_DOMAIN_LISTS = 'Selected domain Lists';
        this.INVENTORY_SELECT_FROM_EXISTING = 'Select from Existing';
        this.ACTIVITIES = 'Activities';

        //Ad Create: 6 Creative
        this.ADDCREATIVETAG = 'Add Creative';
        this.ADDINGTHIRD = 'Adding third party Creative Tags';
        this.ADDEXISTNG = 'Add from Existing';
        this.CREATENEW = 'Create New';
        this.DLTRACKER = 'Download Tracker URLs';
        this.SIZE = 'Size';
        this.TAGNAME = 'Creative Name';
        this.TAGTYPE = 'Type';
        this.ADSRVER = 'Adserver';
        this.SSL = 'SSL';
        this.YOUHAVENTADDED = 'You haven\'t added any Creative Tags for your Ad yet';
        this.COPY = 'Copy';
        this.DELETE = 'Delete';
        this.DOWNLOAD = 'Download';
        this.ARCHIEVE = 'Archive';
        this.CHOOSE_FILTER = 'Choose filter';
        this.SELECT = 'Select';

        //User Creation
        this.super_admin = '1';
        this.account_admin = '2';
        this.advertiser_admin = '3';
        this.generic_user = '4';
        this.WF_USER_CREATION_SUCCESS = 'Created User Successfully';
        this.WF_USER_EDIT_SUCCESS = 'Updated User Successfully';
        this.WF_PERMISSION_NEEDED = 'Atleast 1 permission needed';
        this.WF_USER_CREATION_FAIL = 'Unable to create User';
        this.WF_USER_EDIT_FAIL = 'Unable to update User';

        //Overview Page
        this.ADVERTISER = 'Advertiser';
        this.BRAND = 'Brand';
        this.EDIT = 'Edit';
        this.CLONE = 'Clone';
        this.OBJC = 'Objectives';
        this.KPI = 'KPI';
        this.DELBUDGET = 'Delivery Budget';
        this.FLIGHTDATES = 'Flight Dates';
        this.ADGROUPS = 'Ad Groups';
        this.ADS = 'Ads';
        this.CREATIVES = 'Creatives';
        this.LAST_UPDATED = 'Last Updated';
        this.SORT = 'Sort';
        this.LATEST = 'Latest';
        this.OLDEST = 'Oldest';
        this.CREATEAD = 'Create Ad';
        this.CREATEADGRP = 'Create Ad Group';
        this.SETADGRP = 'Ad Group Setup';
        this.EDITADGRP = 'Ad Group Edit'
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
        this.MEDIAPLANCLONE = 'Clone Media Plan';
        this.NEWMEDIAPLANNAME = 'New Media Plan Name' ;
        this.CLONEMEDIAPLANNAMEERR = 'already exists for this advertiser. Please enter a unique Media Plan name.' ;
        this.DUPLICATELINEITEMS = 'Duplicate Line Items';
        this.DUPLICATEADGROUPS = 'Duplicate Ads & Ad Groups';
        this.AUTOMATICADJUSTFLIGHTDATES = 'Automatically adjust flight dates.';
        this.NEWMEDIAPLANSTARTDATE = 'New Media Plan start date';
        this.KEEPORIGINALFLIGHTDATES = 'Keep original flight dates.';
        this.ARCHIVE = 'Archive';
        this.OPTIMIZATION_REPORT = 'Optimization Impact Report';
        this.BUILD_REPORT = 'Build Report';
        this.CUSTOM_REPORTS = 'Custom Reports';
        this.MEDIA_PLAN_REPORTS = 'Media Plan Reports';
        this.CREATIVES = 'Creatives';

        //media plans
        this.NO_CATEGORY_FOR_SELECTED_ADVERISER = 'No category available for selected advertiser.';
        this.CPA_CONVERSION_MESSAGE = 'All conversion pixels set for CPA line items in your spreadsheet will be automatically associated with this Media Plan.'

        //Overview: Create Ad Groups
        this.CREATEADGROUP = 'Create Ad Group';
        this.WHATADGROUPNAME = 'What is your Ad Group name?';
        this.ADGROUPNAME = 'Ad Group Name';
        this.PLEASENAMEADGRP = 'Please enter a name for the ad group.';
        this.ADGROUPBUDGETMSG = 'Please enter a budget for the ad group.';
        this.ADGROUPMINIMUMBUDGETMSG = 'Please enter a budget value more than the minimum budget for the ad group.';
        this.ADGROUPBUDGETGREATERTHANZEROMSG = 'Please enter a budget value greater than zero.';
        this.ADGROUPMAXIMUMBUDGETMSG = 'Please enter a budget value less than the available media plan budget.';
        this.WHATFLIGHTDATES = 'What are the Flight Dates?';
        this.PLEASESELSTARTDATE = 'Please select the start Date.';
        this.EXPORT_CONVERSION_PIXELS = 'Export All Conversion Pixels' ;
        this.TAGS_FOR_TRACKING_ONLY_ADS = 'Export Ad Tags' ;
        this.MAX_SPEND_FOR_ADGROUP = 'Maximum Spend for Ad Group' ;
        this.LINE_ITEM = 'Line Item' ;
        this.MAX_YOU_CAN_SPEND = "What's the maximum you can spend for your Ad Group?" ;



        //Audience Targeting
        this.SAVEAUD = 'Save Audience';
        this.SELSEGMENTS = 'Select Segments';
        this.OPTIONALPAR = '(Optional)';
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
        this.DONE = 'Done';

        //Day Targeting
        this.DAYPART = 'Daypart';
        this.DAFAULTADNOTE =
            'By default, Ads will be delivered all day every day when no specific daypart rules applied.';
        this.SAVEDAYPART = 'Save Daypart';
        this.DAYTIME = 'Day & Time';
        this.ALLDAYTIMES = 'All days and times';
        this.WEEKDAYMF = 'Weekday (M-F)';
        this.WEEKENDSS = 'Weekend (S,S)';
        this.BUSHOURSMF = 'Business hours (M-F, 9:00AM-5:00PM)';
        this.TVPRIMETIME = 'TV Primetime (8:00PM-11:00PM)';
        this.EARLYMORNING = 'Early Morning (5:00AM-7:00AM)';
        this.LATENIGHT = 'Late Night (11:00PM-1:00AM)';
        this.CUTSCHEDULE = 'Custom schedule';
        this.TIMEZONE = 'Time Zone';
        this.ADVERTISER = 'Advertiser';
        this.VID = 'VID';
        this.ENDUSER = 'End User';
        this.CLOCK = 'Clock';
        this.HR12 = '12 hr';
        this.HR24 = '24 hr';
        this.DELADTIME = 'Deliver Ads on specific days and times';
        this.ADDDAYPART = 'Add Daypart';
        this.CLEARALL = 'Clear All';
        this.SUNDAY = 'Sunday';
        this.MONDAY = 'Monday';
        this.TUESDAY = 'Tuesday';
        this.WEDNESDAY = 'Wednesday';
        this.THURSDAY = 'Thursday';
        this.FRIDAY = 'Friday';
        this.SATURDAY = 'Saturday';
        this.TO = 'to';

        //Geo Targeting
        this.GEOGRAPHY = 'Geography';
        this.INCZIP = 'Including zip / postal codes is going to limit your geographic targeting significantly.';
        this.CONTINUE = 'Continue';
        this.REGCITY = 'REGION & CITY';
        this.REGTABLABEL = 'REGION';
        this.METRO = 'METRO';
        this.ZIPPOSTCODE = 'ZIP / POSTAL CODE';
        this.INCEXCCITYNOTE =
            'Once you include or exclude a city, regions are not available for further inclusion or exclusion.';
        this.REGION = 'Region';
        this.CITY = 'City';
        this.SELECTED = 'Selected';
        this.REGCITIES = 'Regions & Cities';
        this.REMOVEALL = 'Remove All';
        this.METROS = 'Metros';
        this.DMAS = 'DMAs';
        this.SEARCHFORMETROS = 'Search for metros';
        this.SEARCHFORREGIONANDCITY = 'Search for regions or cities';
        this.SEARCHFORREGION = 'Search for regions';

        //Audience Targeting
        this.DEFAULTANDORSTATUS = 'Or';
        this.timeFrameStartDateGreater = 'Timeframe Start date can not be greater than end date';
        this.requiredTimeFrameDates = 'Please provide timeframe dates';
        this.requiredRptNameFreq = 'Please provide report name and frequency';
        this.requiredRptName = 'Please provide report name';
        this.dateRangeWeek = 'You have chosen weekly Scheduling, please choose a date range that is at least one week';
        this.dateRangeMonthly =
            'You have chosen monthly Scheduling, please choose a date range that is at least one month';
        this.minOneMetric = 'Atleast one metrics should be selected';
        this.selectOccursOn = 'Please select occurs on';
        this.selectDate = 'Please select date';
        this.reportNameErrorMsg =
            'Please use only alphanumeric characters for report names. ' +
            'Report name should start with alphabetic character';
        this.START_OR_END_DATE_CAN_NOT_LESS_THAN_CURRENTDATE =
            'Start date or end date cannot be less than the current date';
        this.DELIVER_DATE_CAN_NOT_LESS_THAN_CURRENTDATE = 'Deliver on date cannot be less than the current date';
        this.DIFFERENCE_BETWEEN_START_END_AT_LEAST_ONE_DAY =
            'The difference between Start and End Dates should be at least one day';
        this.SELECT_VALID_DATE_OR_DAY_OCCURS_ON_FIELD = 'Select valid day/date for Occurs On field';
        this.DIFFERENCE_BETWEEN_START_END_AT_LEAST_ONE_WEEK =
            'The difference between Start and End Dates should be at least one week';
        this.SELECT_VALID_CUSTOM_DATE = 'Select valid custom date';
        this.MONTHLY_SCHEDULING_DATE_RANGE__AT_LEAST_ONE_MONTH =
            'You have chosen monthly Scheduling, please choose a date range that is at least one month';
        this.CUSTOMDATE_ERROR_MESSAGE = 'The custom date does not fall within the range of Start and End Dates.';

        this.VIDEO_TARGETING = 'Video Targeting';
        this.SAVE_VIDEO_TARGETING = 'Save Video Targeting';
        this.VIDEO_PLACENMENT_AND_PLAYERS = 'Specify the types of placements and players where you would like your video ad to appear';

        //Creative List
        this.NEWCREATIVEALERT = 'New Creative has been created successfully.';
        this.CREATIVELIBRARY = 'Creative Library';
        this.CREATE = 'Create';
        this.EDIT = 'Edit';
        this.ARCHIVE = 'Archive';
        this.CLONE = 'Clone';
        this.CREATIVENAME = 'Creative Name';
        this.FORMAT = 'Format';
        this.TYPE = 'Type';
        this.ADSERVER = 'Ad Server';
        this.SIZE = 'Size';
        this.ADVERTISER = 'Advertiser';
        this.PLATFORMSPAR = 'Platform(s)';
        this.LASTUPDATED = 'Last Updated';
        this.CAMPAIGNDASHAD = 'Campaign / Ad';
        this.BRAND = 'Brand';
        this.TRACKINGONLY = 'Tracking-Only';
        this.DATANOTAVAILABLE = 'Data not available';
        this.UPDATETAG = 'Update Tag';
        this.CREATIVESDELETE = 'Creatives Delete';
        this.TAB_CHANGED = 'tab_changed';

       // this.EVENT_CLIENT_CHANGED = 'eventClientChanged';
        //this.EVENT_CLIENT_CHANGED_FROM_DASHBOARD = 'advertiserChangedFromDashboard';

        this.EVENT_SUB_ACCOUNT_CHANGED = 'eventSubAccountChanged';
        this.EVENT_SUB_ACCOUNT_CHANGED_FROM_DASHBOARD = 'SubAccountChangedFromDashboard';
        this.EVENT_MASTER_CLIENT_CHANGED = 'eventMasterClientChanged';
        this.SUB_ACCOUNT = "Sub-Account";

        this.ADMIN_ADD_PERMISSION = "Please add permission";
        this.ADMIN_SELECT_CLIENT = "Please select the client";
        this.ADMIN_ADD_ADVERTISER_PERMISSION = "Please add permission for the client";
        this.ERR_EDIT_USER_DATA = "Unable to get the user data";
        this.CLIENTID_EXIST = "Client ID is already selected, please select another id.";
        this.ADVERTISERID_EXIST = "Advertiser ID is already selected, please select another id.";
        this.ADMIN_PAGE_PERMISSION = "Admin has access to all features";
        this.ERR_CREATE_ADVERTISER = "Failed to create the advertiser";
        this.SUCCESS_CREATE_ADVERTISER = "Advertiser successfully created";
        this.SUCCESS_UPDATED_ADVERTISER = "Advertiser updated successfully";
        this.ERR_UPDATE_ADVERTISER = "Failed to update the advertiser";
        this.ERR_CREATE_BRAND = "Failed to create the brand";
        this.SUCCESS_CREATE_BRAND = "Brand successfully created";
        this.BRAND_FEILD_EMPTY = "Please add brand name";
        this.ADVERTISER_FEILD_EMPTY = "Please add advertiser name";
        this.EMPTY_ADV_SELECTION = "Please select the advertiser";
        this.EMPTY_BRAND_SELECTION = "Please select the brand";
        this.EMPTY_LOOKBACK_IMPRESSION = "Please add some value for impression look back field";
        this.EMPTY_LOOKBACK_CLICK = "Please add some value for click look back field";
        this.EMPTY_PIXEL_FIELD = "Please add pixel name";
        this.EMPTY_PIXEL_TYPE = "Please select the pixel type";
        this.EMPTY_PIXEL_EXPIREAT = "Please select the pixel expiration date";
        this.EMPTY_BRAND_LIST = "No Brands available for the advertiser";
        this.ERR_ADD_PIXEL = "Error in adding pixel";
        this.EMPTY_CLIENT_LIST = "No Clients available for the client";
        this.SELECT_CLIENT_TYPE = "Please select the client type";
        this.SELECT_CLIENT_NAME = "Please select the client name";
        this.SELECT_CURRENCY = "Please select the currency";
        this.SELECT_GEOGRAPHY = "Please select the geography";
        this.SELECT_TIMEZONE = "Please select the timezone";
        this.EMPTY_ADCHOICE_CODE = "Please add code for ad-choice";
        this.EMPTY_IAB_CATEGORY = "Please select some category";
        this.EMPTY_IAB_SUB_CATEGORY = "Please select some sub-category";
        this.PIXEL_DOWNLOAD_SUCCESS = "Pixel downloaded successfully";
        this.PIXEL_DOWNLOAD_ERR = "Error in downloading pixel";

        this.SELECT_DIMENSION = 'Select a Dimension';
        this.SELECT_SIZE = 'Select Size';


        // Creative Setup
        this.SAVE_CREATIVE = "Save Creative";
        this.CREATIVE_SETUP = "Creative Setup";
        this.CREATIVE_FOR = "Who is this Creative for?";
        this.CREATIVE_USING = "What Creative are you using?";
        this.CREATIVE_AD_SERVER = "Ad Server";
        this.CREATIVE_CHANNEL = "Channel";
        this.CREATIVE_TEMPLATE = "Creative Template";
        this.CREATIVE_SECURE_TAG = "Secure Tag (SSL compatible)";
        this.CREATIVE_SSL_COMPATIBLE = "SSL compatible";
        this.CREATIVE_SIZE = "Size";
        this.CREATIVE_TYPE = "Type";
        this.CREATIVE_ERR_NAME = "Please enter a name for the creative.";
        this.CREATIVE_ERR_SUBACCOUNT = "Please select the SubAccount.";
        this.CREATIVE_ERR_ADVERTISER = "Please select the Advertiser";
        this.CREATIVE_ERR_AD_SERVER_SIZE = "Please select the Ad Server Size";
        this.CREATIVE_ERR_AD_FORMAT = "Please select the Ad Format";
        this.CREATIVE_ERR_SSL = "Please enter a SSL compatible tag.";
        this.CREATIVE_ERR_SIZE = "Please select the creative size.";
        this.CREATIVE_ERR_TAG_TYPE = "Please select the creative Tag Type.";

        // Media Plan Setup: 1 About
        this.MEDIAPLAN_FOR = "Who is the Media Plan for?";
        this.MEDIAPLAN_NAME = "Media Plan Name";
        this.ABOUTMEDIAPLAN = "Tell us about your Media Plan";
        this.MEDIAPLAN_LABELS = 'Labels (Optional)';
        this.MEDIAPLAN_PURCHASE_ORDER = 'Purchase Order (Optional)';
        this.MEDIAPLAN_RUN = "When do you want your Media Plan to run?";
        this.TARGET = 'Target';

        // Media Plan Setup: 2 Pixels
        this.MEDIAPLAN_PIXEL_SELECT = "Select Conversion Pixels (Optional)";
        this.MEDIAPLAN_PIXEL_REQUIRED = "A Conversion Pixel is required for tracking and reporting conversions and for CPA billing";
        this.MEDIAPLAN_PIXEL_SELECTED = "Selected Pixels";
        this.MEDIAPLAN_PIXEL_LIST = 'Pixels in list';

        // Media Plan Setup: 3 Budget
        this.MEDIAPLAN_BUDGET_MEASURE = "Budget & Measure";
        this.MEDIAPLAN_BUDGET = "Media Plan Budget";
        this.MEDIAPLAN_MARGIN = "Margin (Optional)";
        this.MEDIAPLAN_DELIVERY_BUDGET = "Delivery Budget";
        this.MEDIAPLAN_MEASUREMENT_SETTING_COSTS = "Measurement Settings and Costs";
        this.MEDIAPLAN_ACCOUNT_MEASUREMENT_SETTING = "Account / Advertiser Measurement Settings";
        this.MEDIAPLAN_GENERATE_INVOICES = "The systems used to calculate costs and generate invoices";
        this.MEDIAPLAN_COST_TRACKING = "Cost Tracking |";
        this.MEDIAPLAN_COST_MEASURED = "The Costs that will be measured in Cost Attribution reports and are factored into COGS+ Billing";
        this.MEDIAPLAN_ADD_ADDITIONAL_COSTS = "Add Additional Costs (Optional)";
        this.MEDIAPLAN_METRIC = "Metric";
        this.MEDIAPLAN_VENDOR = "Vendor";
        this.MEDIAPLAN_CONFIGURATION = "Configuration";
        this.MEDIAPLAN_CHANNELS = "Channels";
        this.MEDIAPLAN_CATEGORY = "Category";
        this.MEDIAPLAN_OFFERING = "Offering";
        this.MEDIAPLAN_RATE = "Rate";
        this.MEDIAPLAN_PRICING = "Pricing";
        this.MEDIAPLAN_SETUP_LINE_ITEMS = "Setup Line Items";
        this.MEDIAPLAN_LINE_ITEM_NAME = "Line Item Name / Notes";
        this.MEDIAPLAN_LINE_ITEM = "Line Item";
        this.MEDIAPLAN_RATE_TYPE = "Rate Type";
        this.MEDIAPLAN_BILLABLE_AMOUNT = "Billable Amount";
        this.MEDIAPLAN_VOLUME = "Volume";
        this.MEDIAPLAN_FLIGHT_DATES = "Flight Dates";
        this.IMPORT_LINE_ITEMS = "Import Line Items";
        this.EXPORT_LINE_ITEMS = "Export Line Items";

        this.MEDIAPLAN_ADD_CREDIT = "Add Credit";
        this.MEDIAPLAN_CREDIT_NAME = "Credit Name / Notes";
        this.MEDIAPLAN_AMOUNT = "Amount";
        this.MEDIAPLAN_ADD_ANOTHER_CREDIT = "Add Another Credit";
        this.MEDIAPLAN_FLIGHT_DATE_START = "Flight Date Start";
        this.MEDIAPLAN_FLIGHT_DATE_END = "Flight Date End";

        this.MEDIA_PLAN_CLONE ='Media Plan Clone';
        this.MEDIA_PLAN_WARNING_MESSAGE = 'You will lose your changes if you leave this page. Are you sure?'

        this.MEDIA_PLAN_TOTAL = "Media Plan total*:";
        this.AD_GROUP_TOTAL = "Ad Group total*:";
        this.CAMPAIGN_TOTAL = "Campaign total*:";
        this.INCLUDES_FIXED_COSTS = "*Includes fixed costs";
        this.EXCLUDES_MEDIA_PLAN_FIXED_COSTS = "*Excludes Media Plan fixed costs";

    });
});
