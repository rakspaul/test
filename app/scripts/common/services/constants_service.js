define(['angularAMD'], function(angularAMD) { // jshint ignore:line
    angularAMD.service('constants', ['$locale', function($locale) {
        this.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
        this.CAMPAIGN_LIST_CANCELLER = 10;
        this.CAMPAIGN_FILTER_CANCELLER = 1;
        this.ADDLIBRARY_FILTER_CANCELLER = 10;
        this.PLATFORM_TAB_CANCELLER = 99;
        this.COST_CANCELLER = 2;
        this.DASHBOARD_CANCELLER = 3;
        this.GAUGE_CANCELLER = 4;
        this.SPEND_CHART_CANCELLER = 51;
        this.BUBBLE_CHART_CAMPAIGN_CANCELLER = 53;
        this.INVENTORY_STRATEGY_CANCELLER = 54;
        this.INVENTORY_TACTC_CANCELLER = 55;
        this.STRATEGY_LIST_CANCELLER = 10;
        this.GANTT_CHART_CANCELLER = 6;
        this.GANTT_CHART_BRAND_CANCELLER = 7;
        this.NEW_REPORT_RESULT_CANCELLER = 3;
        this.CLIENT_BILLING_SLICE_LIMIT = 4;

        this.PERIOD_LIFE_TIME = 'life_time';
        this.SORT_DESC = 'desc';
        this.ACTIVE_UNDERPERFORMING = 'underperforming';//has to be this way as per database
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
        this.ADMIN = 'Admin';
        this.INVOICE_TOOL = 'Billing';
        this.DAILYCAP = 'Use daily cap' ;
        this.PROVIDER = 'Providers';


        this.ONTRACK = 'ontrack';
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
        this.BUBBLE_ADVERTISER_CLICKED = 'bubbleAdvertiserClicked';
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
        this.GAUGE_UNDERPERFORMING = 'Off Target';
        this.GAUGE_ONTRACK = 'On Target';
        this.COOKIE_REDIRECT = 'cdesk_redirect';
        this.COOKIE_SESSION = 'cdesk_session';
        this.SPEND = 'Spend';
        this.IMPRESSIONS = 'Impressions';
        this.CTR = 'CTR';
        this.VTC = 'VTC';
        this.CPM = 'CPM';
        this.SUSPICIOUS_ACTIVITY = 'Suspicious Activity %';
        this.VIEWABLE_IMPRESSION = 'Viewable Impressions';
        this.VIEWABLE_RATE = 'Viewable Rate';
        this.ESTREACH = 'Estimated Pool Size';
        this.CPC = 'CPC';
        this.CPA = 'CPA';
        this.PC_CPA = 'Post Click CPA';
        this.ACTION_RATE = 'Action Rate';
        this.SCREENS = 'Screens';
        this.FORMATS = 'Formats';
        this.PLATFORMS = 'Platforms';
        this.CREATIVES = 'Creatives';
        this.AD_SIZES = 'Ad Sizes';
        this.DELETE_CREATIVES = 'Are you sure you want to archive creatives?';
        this.CPMV = 'CPMv';

        this.OPEN_EXCHANGE =  'Open Exchange';
        this.DEAL = 'Deal';
        this.DIRECT = 'Direct';
        this.PLACEMENT = 'Placement';
        this.GROUP = 'Group';
        this.PUBLISHER = 'Publisher';
        this.SELECT_TYPE = 'Select Type';
        this.CHOOSE_TARGETTED_PLACEMENTS = 'Choose targeted placements from the list below';
        this.CAMPAIGN_PRIORITY = 'Campaign Priority';
        this.BID_CPM = 'Bid CPM';
        this.SAVE_SETTINGS = 'Save Settings';
        this.BACK_TO_PLATFORMS = 'Back to Platforms';
        this.BUYING_PLATFORM = 'Buying Platform';
        this.DEAL_ID = 'Deal ID';
        this.MIN_CPM = 'Min. CPM';
        this.MAX_CPM = 'Max. CPM';

        this.COLLECTIVE_INSIGHTS = 'Collective Insights';
        this.UPLOAD_REPORT = 'Upload Report';
        this.REPORT_LABEL ='Report';
        this.ADD_KEYWORDS ='Add Keywords (optional)';
        this.SELECT_DIMENTION ='Select Dimension(s)';
        this.ALL_TYPES ='All Types';
        this.AT_ANY_TIME ='At any time';

        this.SCHEDULED_REPORTS = 'My Reports';
        this.REPORT_TYPES = 'Report Types';
        this.GENERATED = 'Generated';
        this.REPORT_GENERATED = 'Report Generated';
        this.DIMENSIONS_FIVE = 'Dimensions (select up to 5)';
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
        this.SCHEDULE_LIST_REPORT_TYPE = 'Report Types';
        this.SCHEDULE_LIST_DATE = 'Report Generated';
        this.SCHEDULE_LIST_DIMENSIONS = 'Dimensions';
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
            { key:'Yesterday', value:'Yesterday'},
            { key:'Last7Days', value:'Last 7 days'},
            { key:'Last2Weeks', value:'Last 2 weeks'},
            { key:'LastMonth', value:'Last month'},
            { key:'LastQuater', value:'Last quarter'}
        ];

        this.REPORTS_DATE_FORMAT = 'D MMM YYYY';

        this.REPORT_LIST_REPORTTYPES = ['Once', 'Daily', 'Weekly', 'Monthly', 'Saved'];
        this.REPORT_LIST_DIMENSION_COUNT = 'Already five dimensions had been selected';
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
            '<span class="no-data-common">Metric not tracked  in Reporting <span class="contact_note">' +
            'Please contact your Account Manager</span></span>';
        this.MSG_UNKNOWN_ERROR_OCCURED =
            '<div class="no-data-common">Data is unavailable at this time. <div>Please retry later</div>' +
            '<span class="reload-img"></span></div>';
        this.MSG_DATA_NOT_AVAILABLE = '<span class="no-data-common">Data not available</span>';
        this.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD = '<span class="data_not_found">Data not available</span>';
        this.MSG_CAMPAIGN_YET_TO_START = '<span class="no-data-common">This Media Plan is Scheduled to start on {0}.</span>';
        this.MSG_STRATEGY_YET_TO_START = '<span class="no-data-common">This Lineitem is Scheduled to start on {0}.</span>';
        this.MSG_TACTIC_YET_TO_START = '<span class="no-data-common">This Ad is Scheduled to start on {0}.</span>';
        this.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA =
            '<span class="no-data-common">Media Plan is In Flight. Data is not yet available.</span>';
        this.MSG_STRATEGY_ACTIVE_BUT_NO_DATA =
            '<span class="no-data-common">Ad Group is In Flight.</span>';
        this.MSG_TACTIC_ACTIVE_BUT_NO_DATA = '<span class="no-data-common">Ad is In Flight. Data is not yet available.</span>';
        this.MSG_CAMPAIGN_VERY_OLD =
            '<span class="no-data-common">Media Plan Ended. Data is available for 13 Months after End Date.</span>';
        this.MSG_STRATEGY_VERY_OLD =
            '<span class="no-data-common">Ad Group Ended.</span>';
        this.MSG_TACTIC_VERY_OLD = '<span class="no-data-common">Ad Ended. Data is available for 13 Months after End Date.</span>';
        this.MSG_CAMPAIGN_KPI_NOT_SET = '<span class="no-data-common">Your Media Plan must have a KPI.</span>';
        this.MSG_STRATEGY_KPI_NOT_SET = '<span class="no-data-common">Your Ad Group must have a KPI.</span>';
        this.MSG_TACTIC_KPI_NOT_SET = '<span class="no-data-common">Your Ad must have a KPI.</span>';
        this.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED =
            '<span class="no-data-common">No Optimization Activity has been recorded.</span>';
        this.MSG_CAMPAIGN_NOT_OPTIMIZED = '<span class="no-data-common">No Optimization Activity has been recorded.</span>';
        this.MSG_STRATEGY_YET_TO_BE_OPTIMIZED =
            '<span class="no-data-common">No Optimization Activity has been recorded.</span>';
        this.MSG_NO_CAMPAIGNS_WITH_SET_KPI = '<span class="data_not_found">No Media Plan with set KPI value</span>';
        this.DATA_NOT_AVAILABLE_STYLE = 'data_not_found';

        this.NO_ADGROUPS_FOUND = 'No Line Items Found';
        this.NO_MEDIAPLANS_FOUND = 'No Media Plans Found';

        this.NO_RELEVANT_CAMPAIGNS = 'No Relevant Media Plans';
        this.COST_BREAKDOWN = 'Cost Breakdown';
        this.PERFORMANCE = 'Performance';
        this.MARGIN = 'Margin';
        this.BUDGET = 'Budget';
        this.CAMPAIGN_ON_TRACK = 'Media Plan is On Target';
        this.CAMPAIGN_LIST_ITEM_UNDERPERFORMING = 'Off Target';

        this.UNDERPERFORMING_CAMPAIGN = 'Media Plan is Off Target';
        this.NEUTRAL = 'Neutral (no status)';
        this.IMP_WITH_DOT = 'Imps.';
        this.CLICKS = 'Clicks';
        this.QUARTILE_DETAILS = 'Quartile Data';
        this.YET_TO_START = 'Scheduled ';
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
        this.TOTAL_AD_BUDGET = 'Ad Budget';
        this.ESTIMATED_IMPRESSIONS = 'Estimated Impressions';
        this.KPI_NOTSATISFIED_ERROR = 'Values provided for Budget and Unit Cost<br>may not meet the KPI Target.';

        this.SELECT_ALL = 'Select All';
        this.DRAFT = 'Draft';
        this.READY = 'Ready';
        this.SCHEDULED = 'Scheduled';
        this.INFLIGHT_LABEL = 'In Flight';
        this.ACTIVE_LABEL = 'Active';
        this.KPI_ON_TRACK = 'KPI is On Target';
        this.UNDERPERFORMING = 'Off Target';
        this.PAUSED = 'Paused';
        this.COMPLETED = 'Completed';

        this.CREATE_ACTIVITY = 'Create Activity';
        this.ACTIVITY_CREATED_SUCCESSFULLY_VIEW_ACTIVITY_LOG =
            'Success (new line) Activity was saved and will appear in the log below.';
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
        this.PLATFORM = 'Platforms';
        this.TOP_THREE = 'Top 3';
        this.QUALITY = 'Quality';
        this.VIEWABILITY = 'Viewability';
        this.INVENTORY = 'Inventory';
        this.AD_SIZE = 'Ad Size';

        this.TOP = 'Top';
        this.NO_LINKED_STRATEGIES = 'There are no linked Ad Groups';
        this.ONE_S = '1s';
        this.FIVE_S = '5s';
        this.FIFTEEN_S = '15s';
        this.CAMPAIGN_OVERVIEW = 'Media Plan Overview';
        this.DATA = 'Data';
        this.AD_SERVING = 'Ad Serving';
        this.AD_START_IMPS = 'Ad Start Imps.';
        this.CREATIVE = 'Creative';
        this.RESEARCH = 'Research';
        this.OTHER = 'Other';
        this.AD_VERIFICATION = 'Ad Verification';
        this.COLLECTIVECOST = 'Cost';
        this.TOTAL_COST = 'Total Cost';
        this.TOTAL_MARGIN = 'Total Margin';
        this.TOTAL_CLICKS = 'Total Clicks';
        this.TOTAL_VIEW = 'Total Views';
        this.TOTAL_EVENTS = 'Total Events';
        this.TOTAL_SPEND = 'Total Spend';
        this.MARGIN_PERCENTAGE = 'Margin %';
        this.SERVICE = 'Service';
        this.CONVERSIONS = 'Conversions';
        this.DELIVERY = 'Delivery';

        this.CAMPAIGN = 'Media Plan';

        this.FLIGHT_DATES = 'Flight Dates';
        this.METRICS_LIFE_TIME = 'Metrics (Lifetime)';
        this.METRICS = 'Metrics';
        this.METRIC = 'Metric';
        this.SELECTED_METRICS = 'Selected Metrics';
        this.LOAD_MORE_STRATEGIES = 'Load more Line Items';
        this.LOAD_MORE_TACTICS = 'View more Ads.';

        this.STATUS = 'Status';
        this.CALENDAR = 'Calendar';
        this.MOST_RELEVANT_CAMPAIGN = '(Most Relevant Media Plans)';
        this.CAMPAIGN_STATUS = 'Media Plan Status';
        this.PERFORMANCE_STATUS = 'Performance Status';
        this.ON_TRACK = 'On Target';
        this.END_DATES = 'End Dates';
        this.SORT_BY = 'Sort';
        this.WEEK = 'Week';
        this.MONTH = 'Month';
        this.QUARTER = 'Quarter';
        this.YEAR = 'Year';

        this.DASHBOARD = 'Dashboard';
        this.CAMPAIGNS = this.MEDIA_PLAN = 'Media Plans';
        this.CREATE_CAMPAIGN = 'Create';
        this.REPORTS = 'Reports';
        this.HELLO = 'Hello';
        this.ABOUT = 'About';
        this.LOGOUT = 'Log Out';

        this.CATEGORIES = 'Categories';
        this.DOMAINS = 'Domains';
        this.DELIVERED = 'Delivered';
        this.DELIVERED_IMPS = 'Delivered Imps';
        this.VIEW_MODE = 'Media Type';
        this.VIDEO_PLAYS = 'Video Plays';
        this.VIDEO_VIEWS = 'Video Views';
        this.MEASURED_AS_HUNDRED_PERCENT_VIDEO_PLAYED_DIVIDED_BY_AD_START =
            'Measured as 100% Video played divided by Ad start ';
        this.VIDEO_PLAY_COMPLETION_AND_VIDEO_VIEWABILITY_AT_THE_VARIOUS_QUARTILES_OF_THE_AD =
            'Video Viewability at various quartiles of the Ad';
        this.INSUFFICIENT_DATA_POINTS_TO_RENDER_GRAPH = 'There are insufficient data points to render the graph.';
        this.VIDEO_VIEWABILITY = 'Video Viewability';
        this.VIEWABLE_IMPS = 'Viewable Imps.';

        this.SEE_DATES = 'See Dates';
        this.BEFORE = 'Before';
        this.AFTER = 'After';
        this.OPTIMIZATION_TYPE = 'Optimization Type';
        this.DATE_OPTIMIZED = 'Date Optimized';
        this.DATE_FROM = 'Date from';
        this.DATE_TO = 'Date to';
        this.VALUE = 'Value';
        this.BEFORE_VALUE = 'Before Value';
        this.AFTER_VALUE = 'After Value';
        this.CHANGE_IN_PERCENTAGE = 'Change %';
        this.UPLOAD_COMPLETE = 'Upload Complete';
        this.DOWNLOAD_ERROR_LOG = 'Download Error Log';

        this.DAYS_OF_WEEK = 'Days of Week';
        this.DISCREPANCY = 'Discrepancy';
        this.BASED_ONLY_ON_MEASURABLE_IMPS = 'Value based only on Measurable Impressions.';
        this.BASED_ONLY_ON_VIEWABLE_IMPS = 'Value based only on Viewable Impressions.';
        this.VIEWABLE = 'Viewable';
        this.MEASURABLE = 'Measurable';
        this.SSL_ERROR_MESSAGE = 'Please enter a SSL compatible tag.';

        this.PLATFORM_NAME = 'Platform Name';
        this.COLLECTIVE_FEE = 'Collective Fee';

        this.SUSPICIOUS = 'Suspicious';
        this.TOTAL = 'Total';
        this.VIEWLABLETXT_COST = '* Totals includes Fixed Costs';
        this.FORGOT_PASSWORD = 'Forgot Password';
        this.FORGOT_PASSWORD_CONTACT_ACCOUNT_MANAGER = 'Contact your Account Manager to reset your password';
        this.COPY_RIGHTS = 'Copyright &copy; 2016 Collective, Inc. All Rights Reserved';
        this.ABOUT_US = 'About Us';
        this.USERNAME_OR_PASSWORD_INCORRECT = 'The Username/Password is incorrect';
        this.UPGRADE_BROWSER_MESSAGE1 =  'Unfortunately, we do not support your browser. Please upgrade to IE {findVersion}.';
        this.UPGRADE_BROWSER_MESSAGE2 =  'Best viewed in {browserName} version {findVersion} and above. Please upgrade your browser.';
        this.UPGRADE_BROWSER_MESSAGE3 = 'Unfortunately, we don\'t yet support your browser. Please use {browserList}.';

        this.STRATEGY = 'Ad Group';

        this.SCREEN = 'Screen';
        this.SELECT_ALL_SMALL_A = 'Select all';

        this.CHANNEL = 'Channel';
        this.DOWNLOAD_REPORT = 'Download Report';
        this.DOWNLOADING = 'Downloading';

        this.DAY_OF_WEEK = 'Day of Week';
        this.PRIMARY_KPI = 'Primary KPI';

        this.CATEGORIZED_DATA_TOOLTIP =
            'Top 3 per Category shown. Percent (%) value is only available for categorized data. Data captured prior to March 2014 is uncategorized.';

        this.TARGET_ZONE = 'Target Zone';
        this.KPI_ON_TARGET = 'KPI on Target';
        this.KPI_OFF_TARGET = 'KPI off Target';
        this.KPI_UNDERPERFORMANCE = 'KPI Underperformance';
        this.GRAPH_REPRESENTS_CAMPAIGNS_WHICH_HAVE_SET_KPI_VALUES_ONLY =
            '% of Performing Media Plan measured against the set KPI or delivery if no KPI is set.';
        this.VIDEO = 'Video';
        this.SELLER = 'Seller';
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
        this.WF_BRAND = 'Brand';
        this.ADVERTISERS = 'Advertiser';
        this.SELECT_ACCOUNT = 'Select Account';
        this.WF_GOAL = 'Goal';
        this.SELECT_GOAL = 'Select Goal';
        this.START_DATE = 'Start Date';
        this.FLIGHT_START_DATE = 'Start Date';
        this.END_DATE = 'End Date';
        this.FLIGHT_END_DATE = 'End Date';
        this.SELECT_TIME = 'Select Time';
        this.UNTITLED_CAMPAIGN = 'Untitled Media Plan';
        this.SAVE_CAMPAIGN = 'Save Media Plan';
        this.PUSH_CAMPAIGN = 'Push Media Plan';
        this.GROUP_TITLE = 'Group Title';
        this.EDIT = 'Edit';
        this.DFP_DISPLAY = 'DFP Display';
        this.DFP_PRE_ROLL = 'DFP Pre-roll';
        this.TARGETING = 'Targeting';
        this.CONTINUE = 'Continue';
        this.PREVIOUS = 'Previous';
        this.NEXT = 'Next';
        this.PREVIEW = 'Preview';

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
        this.WF_RICH_MEDIA_SEARCH = 'RICH MEDIA';
        this.WF_SOCIAL_SEARCH = 'SOCIAL';
        this.WF_HEADER_PRIMARY_GOAL = 'What is your primary goal?';
        this.WF_AD_GOAL = 'Ad Goal';
        this.WF_PERFORMANCE = 'Performance';
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

        this.WF_DATE_FORMAT = 'D MMM YYYY';

        this.YESTERDAY = 'Yesterday';
        this.REPORT_BUILDER = 'Report Builder';
        this.REPORT_BUILDER_SUBTITLE =
            'Select Dimension(s), Timeframe and any additional parameters to generate your report';
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
        this.WF_INVALID_CREATIVE_TAG =
            'You have entered an invalid tag. Please review this tag carefully and try again';
        this.WF_INVALID_CREATIVE_TAG_TRACKER = 'Please include the %%TRACKER%% macro to save the tag';
        this.WF_CREATIVE_TAG_UPDATE_ERROR = 'Unable to update creative';
        this.WF_CREATIVE_FORCESAVE = 'Unable to forceSave creative';
        this.WF_VIEW_TAG_LABEL = 'View Tag';
        this.WF_ADD_TARGETING_LABEL = 'Add Targeting';
        this.WF_CREATIVE_FORMAT_LABEL = 'Creative Format';
        this.WF_MANDATORY_CREATIVE_FORMAT = 'Please select the creative format.';
        this.WF_MANDATORY_CREATIVE_NAME = 'Please enter a name for the creative.';
        this.WF_INVALID_CLICKTHRU = 'Please enter a valid url.';
        this.WF_AD_ARCHIVE_SUCCESS = 'Ad Archived Successfully';
        this.WF_AD_ARCHIVE_FAILURE = 'Ad Archive Unsuccessful';
        this.WF_CAMPAIGN_ARCHIVE_SUCCESS = 'Media Plan Archived Successfully';
        this.WF_CAMPAIGN_ARCHIVE_FAILURE = 'Media Plan Archive Unsuccessful';
        this.WF_AD_PAUSE_FAILURE = 'Ad Pause Failed';
        this.WF_AD_PAUSE_SUCCESS = 'Ad Paused Successfully';
        this.WF_AD_RESUME_FAILURE = 'Ad Resume Failed';
        this.WF_AD_RESUME_SUCCESS = 'Ad Resumed Successfully';
        this.WF_AD_PAUSE_MESSAGE = 'Are you sure you want to pause delivery ?';
        this.WF_AD_UPDATE = 'Ad Update';
        this.WF_PAUSE_AD = 'Pause Ad';
        this.WF_RESUME_AD = 'Resume Ad';
        this.WF_ARCHIVE_AD = 'We\'re sorry.';
        this.WF_ARCHIVE_CAMPAIGN = 'We\'re sorry.';
        this.WF_REDIRECT_USER_FOR_ARCHIVED_AD =
            'You are unable to edit this archived Ad. Click \'Continue\' to return to Campaign Overview Screen';
        this.WF_REDIRECT_USER_FOR_ARCHIVED_CAMPAIGN =
            'You are unable to edit this archived Media Plan. Click \'Continue\' to return to Media Plan List Screen';
        this.WF_SELECT_MEDIA_PLAN = 'Media Plan';
        this.WF_SELECT_AD_GROUP = 'Ad Group';
        this.WF_NO_AD_GROUP = 'No Ad Group';
        this.WF_CLONE_THIS_AD = 'Clone this Ad to';
        this.WF_CLONE_AD = 'Clone Ad';
        this.WF_CLONE = 'Clone';
        this.WF_PAUSE = 'Pause';
        this.WF_RESUME = 'Resume';
        this.WF_MOVE_TO = 'Move to...';
        this.WF_ARCHIVE = 'Archive';
        this.WF_ARCHIVED = 'Archived';
        this.WF_NOT_SET = 'Not Set';
        this.CLOSE = 'Close';
        this.WF_AD_SAVE_CLOSE = 'Save & Close';
        this.WF_AD_SAVE_CONTINUE = 'Save & Continue';
        this.WF_NAME_CAMPAIGN_TXT = 'Tell us about your Media Plan?';
        this.WF_ENTER_NAME_CAMPAIGN = 'Please enter a name for the Media Plan.';
        this.WF_CAMPAIGN_FOR = 'Who is the Media Plan for?';
        this.WF_CAMPAIGN_OBJECTIVES = 'Media Plan Objectives';
        this.WF_PURCHASE_ORDER = 'Purchase Order';

        this.reportDownloadSuccess = 'Report Downloaded Successfully';
        this.reportDownloadFailed = 'Report Download Failed';

        this.reportEditSuccess = 'Edited Report Successfully';
        this.reportEditFailed = 'Edit Report Failed';

        this.reportDeleteSuccess = 'Deleted Report Successfully';
        this.reportDeleteFailed = 'Deleting Report Failed';
        this.deleteReportHeader = 'Delete Report';
        this.accountChangeHeader = 'Account Change';
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE =
            'Switching accounts will discard any unsaved changes. Do you wish to continue?';
        this.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE =
            'Switching accounts will reload the page. Do you wish to continue?';
        this.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE =
            'Switching accounts will discard any unsaved changes. Do you wish to continue?';
        this.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE =
            'Switching accounts will discard any unsaved changes. Do you wish to continue?';
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
        this.MP_SAVE = 'Save & Close';
        this.MP_CANCEL = 'Cancel';
        this.MP_WHATIS = 'What is your Media Plan Objective?';
        this.MP_PRIGOAL = 'Primary Goal';
        this.MP_SELGOAL = 'Please Select Goal';
        this.MP_PLEASEKPITYPE = 'Please select the KPI type.';
        this.WF_TARGET_IMPRESSIONS_MANDATORY = 'Target Impressions is mandatory';
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

        this.DATE_UK_FORMAT = 'DD/MM/YYYY';
        this.DATE_US_FORMAT = 'MM/DD/YYYY';
        this.DATE_UTC_FORMAT = 'YYYY-MM-DD HH:mm:ss';
        this.DATE_UTC_SHORT_FORMAT = 'YYYY-MM-DD';

        this.IMPRESSION_PER_USER_MESSAGE =
            'You must enter Impression per user less than or equal to Booked Impressions';

        this.CARD_VIEW_REALTIME = 'Real-time Card View';
        this.CARD_VIEW_STANDARD = 'Standard Card View';
        this.CARD_VIEW_REALTIME_MESSAGE = 'The real-time view of Media Plans uses the most recent Visto Tracker<sup>TM</sup> data available. <br/> ' +
            'Real-time data provides preliminary numbers. Values may change after data audit.';


        //Ad Create: Header
        this.OBJECTIVES = 'Objectives';
        this.CONTACTS = 'Contacts';
        this.ADS = 'Ads';

        //Ad Create: Sidebar
        this.ADSETUP = 'Ad Setup';
        this.ADTYPESIDE = '1. About this Ad';
        this.NOTSET = 'Not Set';
        this.FORMATPAR = '(Format)';
        this.ADBUDGET = '(Ad Budget)';
        this.PRIMARYKPIPAR = '(Primary KPI)';
        this.BOOKEDIMPS = '(Booked)';
        this.FREQCAPSIDEBAR = 'Imps. Per User';
        this.SCREENPAR = '(Screen)';
        this.BUDGETDELIVERYSIDE = '2. Budget & Delivery';
        this.FLIGHTPAR = '(Flight)';
        this.UNITCOSTPAR = '(Unit Cost)';
        this.BUYINGPLATFORMSIDE = '3. Buying Platform';
        this.PLATFORMPAR = '(Platform)';
        this.TARGETINGSIDE = '4. Targeting';
        this.AUDIENCE = 'Audience';
        this.INVENTORYSIDE = '5. Inventory Filters';
        this.CREATIVESIDE = '6. Creative';
        this.SELECTEDFREQCAP = '(Freq. Cap)';
        this.SELECTEDVERIFICATIONVENDOR = '(Verification)';


        //Ad Create: 1 Ad Type
        this.SELECTADTYPE = 'About this Ad';
        this.LEARNADTYPES = 'Learn more about Ad Types';
        this.NAMEOFAD = 'Tell us about your Ad';
        this.LABEL = 'Labels (Optional)';
        this.ADNAME = 'Ad Name';

        //Ad Create: 2 Budget & Delivery
        this.SETBUDGET = 'Budget & Delivery';
        this.LEARNMOREADSET = 'Learn more about Ad Settings';
        this.WHENADRUN = 'What are your flight and delivery settings?';
        this.FLIGHTPASSED = 'Media Plan flight date has passed';
        this.ADGROUP_FLIGHTPASSED = 'Ad flight dates cannot be edited';
        this.ADGROUP_FLIGHTPASSED_NO_NEW_ADS = 'Extend the Ad Group flight dates to create Ads';
        this.BUDGET_EXCEEDED = 'Cannot create Ad Group as the Media Plan does not have sufficient budget',

        this.MEDIAPLAN_FLIGHTPASSED_NO_NEW_ADS = 'Cannot create Ad Group as Media Plan has ended',
        this.SETUPBUDGET = 'How would you like to book and deliver this Ad?';

        this.MEASUREBUDGET = 'How would you like to measure this Ad?';
        this.HOWMUCHSPEND = 'How much would you like to spend?';
        this.TRACKBUDGET = 'How do you want to track your Ad?';
        this.UNITCOST = 'Unit Cost';
        this.BUDGETCAL = 'Booking Method';
        this.COST = 'Cost';
        this.FREQCAP = 'Frequency Cap';
        this.IMPPERUSER = 'Impressions per user';
        this.DAILY = 'Daily';
        this.LIFETIME = 'Lifetime';
        this.HOWADDEL = 'How should your Ad deliver?';
        this.PACING = 'Pacing';
        this.PACEEVENLY = 'Pace Evenly';
        this.SENDFAST = 'Spend as fast as possible';
        this.SELECTPRIMARYKPI = 'Primary KPI';
        this.TARGETVALUE = 'Target Value';
        this.RATE = 'Rate';
        this.VERIFICATION_TITLE = 'Which system will validate delivery and measure viewability for this Ad?';
        this.VERIFICATION_VENDOR = 'Verification Vendor' ;
        this.VERIFICATION_DEFAULT = 'None (Disable Verification Tracking)' ;
        this.VERIFICATION_DEFAULT_SMALL = 'None' ;
        this.DAILY_CAP_ERROR_MESSAGE = 'Value is mandatory when selecting Daily Cap';

        //Ad Create: 3 Buying Platform
        this.SELECTBUYPLAT = 'Select Buying Platform';
        this.FULLINT = 'Full Integrations';
        this.SELECTAPLAT = 'Select a Buying Platform';
        this.SELECTED = 'Selected';
        this.MORESELF = 'More Self Service options coming soon';
        this.CANTFIND = 'Can\'t find what you are looking for?';
        this.TRACKINT = 'Tracking Integrations';
        this.MOREPLATAVAIL = 'Tracking Only Integrations';
        this.NOPLATAVAIL = 'No Platforms Configured';
        this.CHGPLAT = 'Change Platform?';
        this.OKAY = 'Okay';

        //Ad Create: 4 Targeting
        this.SETTARGETING = 'Set Targeting';
        this.TARGETAUDCHOOSE = 'Which target audience should I choose for my ad?';
        this.ENABLETARGETINGAD =
            'To enable Targeting for this ad, you must first set a Buying Platform. Select one now?';
        this.SELECTPLATFORM = 'Select Platform';
        this.AUDSEGMENTS = 'Audience Segments';
        this.REACHAUD = 'Reach the right audience by selecting focus segments';
        this.ALLAUD = 'All Audience (default)';
        this.TARGETAUDLOC = 'Target your audience by location';
        this.INCLUDED = 'Included';
        this.INCLUDE = 'Include';
        this.EXCLUDED = 'Excluded';
        this.EXCLUDE = 'Exclude';
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
        this.CSVTXTFILE = 'Only CSV allowed';
        this.DOMAINLIST = 'Domain List';
        this.DOMAIN = 'Domain';
        this.APP = 'App';
        this.UPLOAD_BLACK_LIST = 'Upload Blacklist';
        this.UPLOAD_WHITE_LIST = 'Upload Whitelist';
        this.FILENAME = 'File Name';
        this.LISTNAME = 'List Name';
        this.PLEASEENTERLIST = 'Please enter list name.';
        this.WHITELIST = 'Whitelist';
        this.BLACKLIST = 'Blacklist';
        this.LISTYPEMOD = 'List type cannot be modified. ';
        this.IMPORT = 'Import';
        this.INVENTORY_REPLACE_CURRENT_LIST = 'Replace Current List';
        this.INVENTORY_UPLOAD_NEW_DOMAIN = 'Upload Domain list';
        this.INVENTORY_UPLOAD_NEW_APP = 'Upload App List';
        this.INVENTORY_SELECTED_DOMAIN_LISTS = 'Selected domain Lists';
        this.INVENTORY_SELECT_FROM_EXISTING = 'Select from Existing';
        this.ACTIVITIES = 'Activities';

        //Ad Create: 6 Creative
        this.ADDCREATIVETAG = 'Add Creative';
        this.ADDINGTHIRD = 'Adding third party Creative Tags';
        this.ADDEXISTNG = 'Add from Existing';
        this.CREATENEW = 'Create New';
        this.DLTRACKER = 'Download Tracker URLs';
        this.TAGNAME = 'Creative Name';
        this.TAGTYPE = 'Type';
        this.ADSRVER = 'Adserver';
        this.SSL = 'SSL';
        this.YOUHAVENTADDED = 'You haven\'t added any Creative Tags for your Ad yet';
        this.COPY = 'Copy';
        this.DELETE = 'Delete';
        this.DOWNLOAD = 'Download';
        this.CHOOSE_FILTER = 'Choose filter';
        this.SELECT = 'Select';
        this.ACCOUNT_UPDATED_SUCCESSFULLY = 'Account updated successfully';
        this.ACCOUNT_CREATED_SUCCESSFULLY = 'Account created successfully';

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
        this.CLIENT_CODE_EXIST = 'Already exists. Please choose a different Client Code.';
        this.ADVERTISER_CODE_EXIST = 'Please choose a different Advertiser Code.';
        this.CODE_VERIFICATION = 'Please enter valid 5 alphanumeric characters';
        this.AD_CREATION_INFO = 'will now be created on all the associated buying platforms';

        //Overview Page
        this.ADVERTISER = 'Advertiser';
        this.BRAND = 'Brand';
        this.CLONE = 'Clone';
        this.OBJC = 'Objectives';
        this.KPI = 'KPI';
        this.DELBUDGET = 'Delivery Budget';
        this.FLIGHTDATES = 'Flight Dates';
        this.ADGROUPS = 'Ad Groups';
        this.LAST_UPDATED = 'Last Updated';
        this.SORT = 'Sort';
        this.LATEST = 'Latest';
        this.OLDEST = 'Oldest';
        this.CREATEAD = 'Create Ad';
        this.CREATEADGRP = 'Create Ad Group';
        this.SETADGRP = 'Ad Group Setup';
        this.EDITADGRP = 'Ad Group Edit';
        this.NAMEADGROUP = 'What is the name of your Ad Group?';
        this.ENTERADGRP = 'Please enter a name for the ad group.';
        this.LIKEADSRUN = 'When would you like your Ads to run?';
        this.SELENDDATE = 'Please select the end Date.';
        this.SAVE = 'Save';
        this.PLATNOTSET = 'Platform Not Set';
        this.NOTPUSHEDPAR = '(NOT PUSHED)';
        this.FLTNOTSET = 'Flight Date Not Set';
        this.AD = 'AD';
        this.CHOOSEONE = 'Choose One';
        this.BROWSER = 'Browser';
        this.APPS = 'Apps';
        this.APP_LISTS = 'App Lists';
        this.DOMAIN_LISTS = 'Domain Lists';
        this.ALL_LISTS = 'All Lists';
        this.STEPSETTING = '1. Setting';
        this.STEPBUYINGPLAT = '2. Buying Platform';
        this.STEPTARGETTING = '3. Targetting';
        this.STEPCREATIVES = '4. Creatives';
        this.CCOLBIDDER = 'C Collective Bidder';
        this.BIDSTRATEGY = 'Bidding Strategy';
        this.ADTYPE = 'Ad Type';
        this.SHOWPRESET = 'Show Preset';
        this.PE = 'Pe';
        this.KEYVALUE = 'Key Value';
        this.USERPART = 'User Partition';
        this.BUDGERPART = 'Budger Partition';
        this.MINBID = 'Min. Bid';
        this.MAXCOST = 'Max Cost';
        this.MEDIAPLANUPD = 'Media Plan Update';
        this.MEDIAPLANCLONE = 'Clone Media Plan';
        this.NEWMEDIAPLANNAME = 'New Media Plan Name';
        this.CLONEMEDIAPLANNAMEERR = 'already exists for this advertiser. Please enter a unique Media Plan name.';
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

        //media plans
        this.NO_CATEGORY_FOR_SELECTED_ADVERISER = 'No category available for selected advertiser.';
        this.CPA_CONVERSION_MESSAGE =
            'All conversion pixels set for CPA line items in your spreadsheet will be automatically associated with ' +
            'this Media Plan.';

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
        this.EXPORT_CONVERSION_PIXELS = 'Export All Conversion Pixels';
        this.TAGS_FOR_TRACKING_ONLY_ADS = 'Export Ad Tags';
        this.MAX_SPEND_FOR_ADGROUP = 'Maximum Spend for Ad Group';
        this.LINE_ITEM = 'Line Item';
        this.MAX_YOU_CAN_SPEND = 'What\'s the maximum you can spend for your Ad Group?';
        this.ADD_LINE_ITEM = 'Add Line Item';
        this.ZERO_MESSAGE = 'You have entered $0 for your rate or billable amount.';



        //Audience Targeting
        this.SAVEAUD = 'Save Audience';
        this.SELSEGMENTS = 'Select Segments';
        this.OPTIONALPAR = '(Optional)';
        this.KEYWORD = 'Keyword';
        this.SOURCE = 'Source';
        this.CATEGORY = 'Category';
        this.SEGMENTNAME = 'Segment Name';
        this.NORESULTSFOUND = ' No Results Found...';
        this.AND = 'And';
        this.OR = 'Or';
        this.IS = 'Is';
        this.ISNOT = 'Is Not';
        this.SELECTED_PLACEMENTS = 'Selected Placements';
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
        this.VID = 'VID';
        this.ENDUSER = 'End User';
        this.CLOCK = 'Clock';
        this.HR12 = '12 hr';
        this.HR24 = '24 hr';
        this.DELADTIME = 'Deliver Ads on specific days and times';
        this.ADDDAYPART = 'Add Daypart';
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
        this.SAVE_GEOGRAPHY = 'Save Geography';
        this.COUNTRY = 'Country';
        this.INCZIP = 'Including zip / postal codes is going to limit your geographic targeting significantly.';
        this.ZIP_CODE_LABEL = 'Separate zip / postal codes by comma. Use hyphens to denote ranges.';
        this.REGCITY = 'REGION & CITY';
        this.REGTABLABEL = 'REGION';
        this.METRO = 'METRO';
        this.ZIPPOSTCODE = 'ZIP / POSTAL CODE';

        this.NOT_SELECTED_COUNTRY_NOTE =
            'Once you have set your targeting at the region level, you cannot select any countries for inclusion or ' +
            'exclusion';
        this.NOT_SELECTED_REGION_NOTE =
            'Once you have set your targeting at the city level, you cannot select any regions for inclusion or ' +
            'exclusion';
        this.NOT_SELECTED_COUNTRY_REGION_NOTE =
            'Once you have set your targeting at the city level, you cannot select any countries for inclusion or ' +
            'exclusion';

        this.REGION = 'Region';
        this.CITY = 'City';
        this.TARGETING_LABEL = 'Targeting';
        this.REMOVEALL = 'Remove All';
        this.METROS = 'Metros';
        this.METROTXT = 'Metro';
        this.GEO = 'GEO';
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
        this.VIDEO_PLACENMENT_AND_PLAYERS =
            'Specify the types of placements and players where you would like your video ad to appear';

        //Creative List
        this.NEWCREATIVEALERT = 'New Creative has been created successfully.';
        this.CREATIVELIBRARY = 'Creative Library';
        this.CREATIVENAME = 'Creative Name';
        this.FORMAT = 'Format';
        this.TYPE = 'Type';
        this.ADSERVER = 'Ad Server';
        this.SIZE = 'Size';
        this.PLATFORMSPAR = 'Platform(s)';
        this.LASTUPDATED = 'Last Updated';
        this.CAMPAIGNDASHAD = 'Media Plan / Ad';
        this.TRACKINGONLY = 'Tracking-Only';
        this.DATANOTAVAILABLE = 'Data not available';
        this.UPDATETAG = 'Update Tag';
        this.CREATIVESDELETE = 'Archive Creatives';
        this.TRACKING_MESSAGE = 'Use 3rd party tracking code';
        this.CAUTION_MSG = '<b>Caution</b>: 3rd party tracking code may not be compatible with this ad server configuration or your selected buying/execution platform. ' +
            'Be sure to consult with Visto support or your Collective Visto account manager before using this code in a live ad.';
        this.TAB_CHANGED = 'tab_changed';

       // this.EVENT_CLIENT_CHANGED = 'eventClientChanged';
        //this.EVENT_CLIENT_CHANGED_FROM_DASHBOARD = 'advertiserChangedFromDashboard';
        this.INVOICE_ADJUSTMENT_FIELD_EMPTY = 'Please enter valid Type, Notes, Amounts';

        this.EVENT_SUB_ACCOUNT_CHANGED = 'eventSubAccountChanged';
        this.EVENT_SUB_ACCOUNT_CHANGED_FROM_DASHBOARD = 'SubAccountChangedFromDashboard';
        this.EVENT_MASTER_CLIENT_CHANGED = 'eventMasterClientChanged';
        this.SUB_ACCOUNT = 'Sub-Account';
        this.NICK_NAME = 'Nick Name';
        this.ACCOUNT_NICKNAME = 'Account Nickname:';
        this.ADMIN_ADD_PERMISSION = 'Please add permission';
        this.ADMIN_SELECT_CLIENT = 'Please select the client';
        this.ADMIN_ADD_ADVERTISER_PERMISSION = 'Please add permission for the client';
        this.ERR_EDIT_USER_DATA = 'Unable to get the user data';
        this.CLIENTID_EXIST = 'Client ID is already selected, please select another id.';
        this.ADVERTISERID_EXIST = 'Advertiser ID is already selected, please select another id.';
        this.ADMIN_PAGE_PERMISSION = 'Admin has access to all features';
        this.ERR_CREATE_ADVERTISER = 'Failed to create the advertiser';
        this.SUCCESS_CREATE_ADVERTISER = 'Advertiser successfully created';
        this.SUCCESS_UPDATED_ADVERTISER = 'Advertiser updated successfully';
        this.ERR_UPDATE_ADVERTISER = 'Failed to update the advertiser';
        this.ERR_CREATE_BRAND = 'Failed to create the brand';
        this.SUCCESS_CREATE_BRAND = 'Brand successfully created';
        this.BRAND_FEILD_EMPTY = 'Please add brand name';
        this.ADVERTISER_FEILD_EMPTY = 'Please add advertiser name';
        this.EMPTY_ADV_SELECTION = 'Please select the advertiser';
        this.EMPTY_BRAND_SELECTION = 'Please select the brand';
        this.EMPTY_LOOKBACK_IMPRESSION = 'Please add some value for impression look back field';
        this.EMPTY_LOOKBACK_CLICK = 'Please add some value for click look back field';
        this.PIXEL_TYPE_PAGE_VIEW = 'Action - Page View';
        this.PIXEL_TYPE_AUDIENCE_CREATION = 'Audience Creation Pixel';
        this.PIXEL_TYPE_RETARGETING = 'Retargeting Pixel';
        this.EMPTY_PIXEL_FIELD = 'Please add pixel name';
        this.EMPTY_PIXEL_TYPE = 'Please select the pixel type';
        this.EMPTY_PIXEL_EXPIREAT = 'Please select the pixel expiration date';
        this.EMPTY_PIXEL_CODE = 'Please add some pixel code without any special characters, max character limit 20';
        this.EMPTY_BRAND_LIST = 'No Brands available for the advertiser';
        this.ERR_ADD_PIXEL = 'Error in adding pixel';
        this.EMPTY_CLIENT_LIST = 'No Clients available for the client';
        this.SELECT_CLIENT_TYPE = 'Please select the client type';
        this.SELECT_CLIENT_NAME = 'Please select the client name';
        this.SELECT_CURRENCY = 'Please select the currency';
        this.SELECT_GEOGRAPHY = 'Please select the geography';
        this.SELECT_TIMEZONE = 'Please select the timezone';
        this.EMPTY_ADCHOICE_CODE = 'Please add code for ad-choice';
        this.EMPTY_IAB_CATEGORY = 'Please select some category';
        this.EMPTY_IAB_SUB_CATEGORY = 'Please select some sub-category';
        this.PIXEL_DOWNLOAD_SUCCESS = 'Pixel downloaded successfully';
        this.PIXEL_DOWNLOAD_ERR = 'Error in downloading pixel';

        this.SELECT_DIMENSION = 'Select a Dimension';
        this.SELECT_SIZE = 'Select Size';


        // Creative Setup
        this.SAVE_CREATIVE = 'Save Creative';
        this.CREATIVE_SETUP = 'Creative Setup';
        this.CREATIVE_FOR = 'Who is this Creative for?';
        this.CREATIVE_USING = 'What Creative are you using?';
        this.CREATIVE_AD_SERVER = 'Ad Server';
        this.CREATIVE_CHANNEL = 'Channel';
        this.CREATIVE_TEMPLATE = 'Creative Template';
        this.CREATIVE_SECURE_TAG = 'Secure Tag (SSL compatible)';
        this.CREATIVE_SSL_COMPATIBLE = 'SSL compatible';
        this.CREATIVE_SIZE = 'Size';
        this.CREATIVE_TYPE = 'Type';
        this.CREATIVE_ERR_NAME = 'Please enter a name for the creative.';
        this.CREATIVE_ERR_SUBACCOUNT = 'Please select the SubAccount.';
        this.CREATIVE_ERR_ADVERTISER = 'Please select the Advertiser';
        this.CREATIVE_ERR_AD_SERVER_SIZE = 'Please select the Ad Server Size';
        this.CREATIVE_ERR_AD_FORMAT = 'Please select the Ad Format';
        this.CREATIVE_ERR_SSL = 'Please enter a SSL compatible tag.';
        this.CREATIVE_ERR_SIZE = 'Please select the creative size.';
        this.CREATIVE_ERR_TAG_TYPE = 'Please select the creative Tag Type.';

        // Media Plan Setup: 1 About
        this.MEDIAPLAN_FOR = 'Who is the Media Plan for?';
        this.MEDIAPLAN_NAME = 'Media Plan Name';
        this.ABOUTMEDIAPLAN = 'Tell us about your Media Plan';
        this.MEDIAPLAN_LABELS = 'Labels (Optional)';
        this.MEDIAPLAN_PURCHASE_ORDER = 'Purchase Order (Optional)';
        this.MEDIAPLAN_RUN = 'When do you want your Media Plan to run?';
        this.TARGET = 'Target';

        // Media Plan Setup: 2 Pixels
        this.MEDIAPLAN_PIXEL_SELECT = 'Select Conversion Pixels (Optional)';
        this.MEDIAPLAN_PIXEL_REQUIRED = 'Conversion Pixels are required for conversion reports and CPA billing.';
        this.MEDIAPLAN_PIXEL_SELECTED = 'Selected Pixels';
        this.MEDIAPLAN_PIXEL_LIST = 'Pixels in list';

        // Media Plan Setup: 3 Budget
        this.MEDIAPLAN_BUDGET_MEASURE = 'Budget & Measure';
        this.MEDIAPLAN_BUDGET = 'Media Plan Budget';
        this.MEDIAPLAN_MARGIN = 'Margin (Optional)';
        this.MEDIAPLAN_DELIVERY_BUDGET = 'Delivery Budget';
        this.MEDIAPLAN_MEASUREMENT_SETTING_COSTS = 'Measurement Settings and Costs';
        this.MEDIAPLAN_ACCOUNT_MEASUREMENT_SETTING = 'Account / Advertiser Measurement Settings';
        this.MEDIAPLAN_GENERATE_INVOICES = 'The systems used to calculate costs and generate invoices';
        this.MEDIAPLAN_COST_TRACKING = 'Cost Tracking |';
        this.MEDIAPLAN_COST_MEASURED =
            'The Costs that will be measured in Cost Attribution reports and are factored into COGS+ Billing';
        this.MEDIAPLAN_ADD_ADDITIONAL_COSTS = 'Add Additional Costs (Optional)';
        this.MEDIAPLAN_METRIC = 'Metric';
        this.MEDIAPLAN_VENDOR = 'Vendor';
        this.MEDIAPLAN_CONFIGURATION = 'Configuration';
        this.MEDIAPLAN_CHANNELS = 'Channels';
        this.MEDIAPLAN_CATEGORY = 'Category';
        this.MEDIAPLAN_OFFERING = 'Offering';
        this.MEDIAPLAN_RATE = 'Rate';
        this.MEDIAPLAN_PRICING = 'Pricing';
        this.MEDIAPLAN_SETUP_LINE_ITEMS = 'Setup Line Items';
        this.MEDIAPLAN_LINE_ITEM_NAME = 'Line Item Name';
        this.MEDIAPLAN_LINE_ITEM = 'Line Item';
        this.MEDIAPLAN_RATE_TYPE = 'Rate Type';
        this.MEDIAPLAN_BILLABLE_AMOUNT = 'Billable Amount';
        this.MEDIAPLAN_VOLUME = 'Volume';
        this.MEDIAPLAN_FLIGHT_DATES = 'Flight Dates';
        this.IMPORT_LINE_ITEMS = 'Import Line Items';
        this.EXPORT_LINE_ITEMS = 'Export Line Items';
        this.NO_LINE_ITEMS_ERR = 'You haven\'t added any Line Items for your Media Plan yet';
        this.CREATE_ADGROUP_LINEITEM = 'Create Ad Group for Line Item';

        this.MEDIAPLAN_ADD_CREDIT = 'Add Credit';
        this.MEDIAPLAN_CREDIT_NAME = 'Credit Name / Notes';
        this.MEDIAPLAN_AMOUNT = 'Amount';
        this.MEDIAPLAN_ADD_ANOTHER_CREDIT = 'Add Another Credit';
        this.MEDIAPLAN_FLIGHT_DATE_START = 'Flight Start Date';
        this.MEDIAPLAN_FLIGHT_DATE_END = 'Flight End Date';
        this.SAVE_CHANGES = 'Save Changes';
        this.SELECT_CONVERSION_PIXELS = 'Conversion Pixel';
        this.SELECT_SYSTEM_OF_RECORD = 'System of Record';
        this.SELECT_VOLUME_TYPE = 'Volume Type';
        this.AD_GRP_NAME='Ad Group Name';
        this.TOTAL_BILLABLE_AMOUNT = 'Total Billable Amount';

        this.MEDIA_PLAN_CLONE ='Media Plan Clone';
        this.MEDIA_PLAN_WARNING_MESSAGE = 'You will lose your changes if you leave this page. Are you sure?';

        this.MEDIA_PLAN_TOTAL = 'Media Plan Total:';
        this.AD_GROUP_TOTAL = 'Ad Group Total:';
        this.CAMPAIGN_TOTAL = 'Campaign Total:';
        this.LINE_ITME_TOTAL = 'Line Item Total:';
        this.MEDIA_PLAN_TOTALS = 'Media Plan Totals';
        this.LINE_ITEM_TOTALS = 'Line Item Totals';

        this.INCLUDES_FIXED_COSTS = '*Includes Fixed Costs';
        this.EXCLUDES_MEDIA_PLAN_FIXED_COSTS = '*Excludes Media Plan fixed costs';

        this.CLIENT_LOADED = 'clientLoaded';

        // Invoice Report
        this.INVOICE_REPORT = 'Invoice Reports';
        this.ADJUSTMENTS = 'Adjustments';
        this.INVOICE_REPORT_ADD_ADJUSTMENT = 'Add Adjustment to Invoice Report';
        this.INVOICE_DOWNLOAD = 'Download Invoice Report';
        this.INVOICE_UPLOAD_SOR = 'Upload System of Record(SOR) Results';
        this.INVOICE_DOWNLOAD_SOR = 'Download Line Items Requiring (SOR) Results';
        this.CREDIT_ADD_SUCCESS = 'Credit added/updated successfully';
        this.CREDIT_ADD_ERR = 'Error in adding/updating the credit ';
        this.INVOICE_VIEW_REPORT = 'View Invoice Report ';
        this.INVOICE_VIEW_REPORT_ALL = 'View All Invoice Reports';
        this.INVOICE_REPORT_MEDIA_PLAN = 'Media Plan (Expand to see invoice reports)';
        this.INVOICE_REPORT_STATUS = 'Status';
        this.INVOICE_REPORT_DATE = 'Invoice Date';
        this.INVOICE_REPORT_SPEND = 'Total Spend';
        this.INVOICE_REPORT_ADJUSTMENTS = 'Adjustments';
        this.INVOICE_REPORT_BILLABLE = 'Billable';
        this.INVOICE_REPORT_ACCOUNT = 'Account/Advertiser';
        this.INVOICE_ADD_ADJUSTMENT = 'Add Another Adjustment';
        this.INVOICE_REPORT_DONWLOAD_SUCCESS = 'Invoice report donwloaded successfully';
        this.INVOICE_TEMPLATE_DOWNLOAD_SUCCESS = 'Template downloaded successfully';
        this.INVOICE_UPLOAD_UNSUPPORTED = 'File Drag/Drop is not supported for this browser';
        this.INVOICE_UPLOAD_FILE_UNSUPPORTED = 'Cannot upload files bigger than 10MB / Unsupported file format';
        this.INVOICE_REPORT_DONWLOAD_ERR = 'Error in Invoice report donwload';
        this.INVOICE_TEMPLATE_DOWNLOAD_ERR = 'Error in Template download';
        this.INVOICE_DROPDWON_READY = 'The Invoice Report is ready for download';
        this.INVOICE_DROPDWON_REVIEW = 'The Invoice Report has been updated by an external upload and must be reviwed';
        this.INVOICE_DROPDWON_CLOSED =
            'The Invoice Report has been reviwed and accepted. Reports with closed Status cannot be modified';
        this.INVOICE_DROPDWON_UPLOAD =
            'The Invoice Report requires modification by Uploaded <br> System of Record (SOR) Results';
        this.INVOICE_CONFIRM_CLOSE = 'Do you want to close the invoice permanently.';
        this.INVOICE_CONFIRM_UPLOAD =
            'Once the invoice status changed to upload, user must upload the file to change the status.';
        this.CODE_FIELD_EMPTY = 'Please add code';

        //vendors page
        this.VENDORS = 'Vendors' ;
        this.VENDOR_CONFIGURATION = 'My Vendor Configurations';
        this.CONFIGURATION = 'Configuration';
        this.ID = 'ID';
        this.VENDOR = 'Vendor';
        this.OWNER = 'Owner';
        this.CURRENCY = 'Currency';
        this.UPDATED = 'Updated';
        this.VIEW_SUMMARY = 'View Summary' ;
        this.CONTRACT_DATES = 'Contract Dates' ;
        this.SEAT_ID_CONNECTIONS = 'Seat ID | Connections' ;
        this.ENABLE = 'Enable' ;
        this.OFFERING = 'Offering' ;
        this.BASE_RATE_TYPE = 'Base Rate & Type' ;
        this.SEAT_ID_CONNECTIONS = 'Seat ID | Connections' ;
        this.REPORT_BUILDER_METRIC_TOOLTIP = 'Metrics that don\'t apply to the selected Dimension(s) will be disabled.';
        this.WF_UNSPECIFIED = 'Unspecified Size';

                //Admin Page
        this.ABOUT_THIS_ACCOUNT = 'About this Account';
        this.ACCOUNT_TYPE = 'Account Type:';
        this.ACCOUNT_NAME = 'Account Name:';
        this.ACCOUNT_CODE = 'Account Code:';
        this.ADMIN_CURRENCY = 'Currency:';
        this.ADMIN_GEOGRAPHY = 'Geography:';
        this.ADMIN_TIMEZONE = 'Timezone:';
        this.AD_CHOICES = 'Ad Choices';
        this.ENTER_CODE = 'Enter Code:';
        this.ENABLE_AD_CHOICES = 'Enable Ad Choices:';
        this.AD_CHOICES_CODE_BLOCK = 'Ad Choices Code Block:';
        this.BILLING_METHOD = 'Billing Method';
        this.NON_BILLABLE_ACCOUNT = 'Non-billable Account';
        this.VISTO_LICENCE_USAGE_FEES = 'VISTO Licence & Usage Fees';
        this.SELECT_FEE_TYPE = 'Select Fee Type:';
        this.MONTHLY_FLAT_FEE = 'Monthly Flat Fee:';
        this.MONTHLY_BASIS = 'This fee is applied on a monthly basis.';
        this.BILLING_FEE = 'Fee';
        this.BILLING_START = 'Billing Start';
        this.BILLING_TOTAL_CPM = 'Total CPM';
        this.BILLING_TOTAL_CPM_DESCRIPTION = 'CPM rate, calculated from Visto Trackers impression counts for all Media Plans run for this account and all of its child accounts.';
        this.ITEMIZE_CPM_FEES = 'Itemize CPM fees';
        this.BILLING_TOTAL_CPM_FEES = 'The total CPM fees will be broken down into the following portions in the invoice files:';
        this.BILLING_LABEL = 'Label';
        this.BILLING_PORTION = 'Portion';
        this.TOTAL_COGS = 'Total COGS + %';
        this.TOTAL_COGS_DESCRIPTION = 'Visto will pass through all costs incurred while executing Media Plans (e.g. media costs, ad serving costs), plus a percentage markup.';
        this.TOTAL_MARKUP = 'Total Markup';
        this.ITEMIZE_FEES = 'Itemize Fees';
        this.TOTAL_MARKUP = 'The total markup will be broken down into the following portions in the invoice files:';
        this.TOTAL_COGS_CPM = 'Total COGS + CPM';
        this.TOTAL_COGS_CPM_DESCRIPTION = 'Visto will pass through all costs incurred while executing Media Plans (e.g. media costs, adserving costs), plus a percentage markup';
        this.TOTAL_PCT_MARKUP = 'Total Pct. Markup';
        this.PCT_GROSS_REVENUE = '% of Gross Revenue';
        this.PCT_GROSS_REVENUE_DESCRIPTION = 'Visto will change a percentage of Gross Revenue (Sum of Billable Amounts for ' +
            'all Line Item run under this Account and its Sub-Accounts).';
        this.TOTAL_MARKUP_BROKEN = 'The total markup will be broken down into the following portions in the invoice files:';
        this.PCT_NET_REVENUE = '% of Net Revenue';
        this.PCT_NET_REVENUE_DESCRIPTION = 'Visto will charge a percentage of Net Revenue';



        this.NOTHINGSELECTED = 'Nothing is Selected' ;
        this.GEONOTE = 'Selections made in the "Select Access" <br> component will appear in this area' ;
        this.ERROR = 'Unkown Error:';
        this.NOTE_ADCHOICE_CODE = 'Note: Empty ad choice field will take default ad choice code from the system.';
        this.WF_PAUSE_ALL = 'Pause All';
        this.WF_RESUME_ALL = 'Resume All';
        this.SELECTCOUNTRY = 'Select Country';
        this.PASSWORD_LENGTH_ERROR = 'Password should have more than 6 characters' ;
        this.PASSWORD_MATCH_ERROR = 'Passwords are not matching' ;
        this.PASSWORD = 'Password' ;
        this.UPDATE_PASSWORD = 'Update Password' ;
        this.CONFIRM_PASSWORD = 'Confirm Password' ;
        this.CHANGE_PASSWORD = 'Change Password' ;
        this.PASSWORD_SUCCESS_MSG = 'Password successfully changed' ;
        this.TECH_FEES = 'Tech';
        this.SPECIAL_CHARACTER_ERROR = 'Please omit any punctuation or special characters (e.g. &, @, etc)' ;
        this.LINEITEM_SETUP = 'Line Item Setup' ;
        this.LINEITEM_EDIT = 'Line Item Edit' ;
        this.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_ADVERTISER = 'There are no Media Plans for the selected Advertiser';
        this.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_BRAND = 'There are no Media Plans for the selected Brand';
        this.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_ACCOUNT = 'There are no Media Plans for the selected account';
        this.LARGE_ZIP_CODE_LENGTH = 'Request zip code length is to large';
        this.ADVERTISER_BILLING_SETTINGS_ERROR = 'There is an error in Account Advertiser Billing Settings';
        this.CLIENT_BILLING_SETTINGS_ERROR = 'There is an error in Client Billing Settings';
        this.BILLING_SETTING_PERCENT_ERROR = 'The rate should be 0 - 100%';
        this.BILLING_ITEMIZATION_SUM_ERROR = 'Itemization item values must add up to ';
        this.BILLING_ITEMIZATION_PERCENT_ERROR = 'Itemization item values must add up to ';

        this.SIGN_IN_LABEL = 'Sign In';
        this.USERNAME_PLACEHOLDER = 'Username';
        this.PASSWORD_LABEL = 'Password';
        this.INVOICE_ACCOUNT = 'Account:';
        this.INVOICE_ADVERTISER = 'Advertiser:';
        this.INVOICE_ID = 'Invoice ID:';
        this.INVOICE_MONTH = 'Invoice Month:';
        this.INVOICE_MEDIA_PLAN = 'Media Plan';
        this.INVOICE_REPORT = 'Invoice Reports';
        this.INVOICE_NOTES = 'Notes:';
        this.VIDEO_COMPLETION_AND_VIEWABILITY_AT_VARIOUS_QUARTILES_OF_AD = 'Video Viewability at various quartiles of the Ad' ;

        //Seller Targeting
         this.SELLERNAME = 'Seller Name';
         this.SELLERID = ' Seller ID';
         this.PREFERRED = 'Preferred';
         this.SELLERS = 'Sellers';
         this.SELLERS_TARGETING = 'Include or exclude specific 3rd party inventory sellers from your Open Exchange buy.';
         this.SAVESELLER ='Save Seller';
         this.NOSELLERSELECTED ='No Sellers Selected';
         this.SELLERNOTE ='Check the checkbox next to the desired Seller name to target.';
         this.SELECTED_SEGMENTS = 'Selected';
         this.CLEARALL = 'Clear All';

        this.NO_AUDIENCE_SELECTED = 'No Audience Selected' ;

        this.RB_SELECTION_CHANGE_MSG = 'You have changed the selection, please generate again to match with Download';
        this.NOTE_WITH_COLON = 'Note:';
        this.SUBACCOUNT_CHANGED = 'subaccount_changed';


    }]);
});
