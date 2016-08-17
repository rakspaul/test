define([
    'angularAMD',
    'angular-route',
    'angular-cookies',
    'angular-resource',
    'angular-cache',
    'moment',
    'moment-tz',
    'tmhDynamicLocale',
    'underscore',
    'angular-css',
    'd3',
    'angular-sanitize',
    'jquery-ui',
    'filesaver',
    'ui-bootstrap-tpls',
    'angular-switch',
    'ng-file-upload',
    'ng-file-upload-shim',
    'bootstrap-toggle',
    'date-picker',
    'multiselect',
    'highcharts',
    'highcharts-ng',
    'highcharts-more',
    'solid-gauge',
    'showErrors',
    'ng-tag',
    'chosen',

    'common/services/local_storage_service',
    'common/services/account_service',
    'common/services/sub_account_service',
    'common/services/page_finder',
    'common/services/url_builder',
    'common/services/data_service',
    'common/services/role_based_service',
    'common/services/constants_service',
    'common/directives/common_directives',
    'common/controllers/header_controller',
    'common/controllers/popup_msg_controller',
    'common/controllers/confirmation_modal_controller',
    'common/controllers/account_change_controller',
    'common/popup_msg',
    'common/moment_utils',
    'common/filter',
    'common/directive',
    'common/services/features_service',
    'common/services/sub_account_service',
    'common/services/vistoconfig_service',
    'common/services/route_resolvers_params_service',
    'common/services/route_resolvers_service',

    'login/login_service',
    'login/login_model',

    'reporting/brands/brands_model',
    'reporting/common/change_password_controller',
    'reporting/controllers/gantt_chart_controller',
    'reporting/dashboard/dashboard_controller',
    'reporting/brands/brands_controller',
    'reporting/common/d3/gauge',
    'reporting/controllers/gauge_controller',
    'reporting/common/d3/gauge_directive',
    'reporting/controllers/bubble_chart_controller',
    'reporting/common/d3/screen_chart',
    'reporting/common/d3/bar_chart',
    'reporting/controllers/screen_chart_controller',
    'reporting/common/d3/gantt_directive',
    'reporting/campaignList/campaign_list_controller',
    'reporting/models/domain_reports',
    'reporting/campaignSelect/campaign_select_directive',
    'reporting/directives/campaign_sort',
    'reporting/campaignSelect/campaign_select_controller',
    'reporting/advertiser/advertiser_model',
    'reporting/advertiser/advertiser_controller',
    'reporting/timePeriod/time_period_controller',
    'reporting/timePeriod/time_period_pick_controller',
    'reporting/collectiveReport/reports_schedule_list_controller',
    'reporting/collectiveReport/collective_report_listing_controller',
    'reporting/strategySelect/strategy_select_model',

    'workflow/campaign/campaign_create_controller',
    'workflow/campaign/line_item_controller',
    'workflow/vendors/vendors_list_controller',
    'workflow/vendors/vendor_create_controller'
], function (angularAMD) {
    return angularAMD;
});
