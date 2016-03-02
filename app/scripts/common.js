define(['angularAMD',
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
    'date-picker',
    'jquery-ui',
    'filesaver',
    'ui-bootstrap-tpls',
    'angular-switch',
    'ng-file-upload',
    'ng-file-upload-shim',
    'bootstrap-toggle',
    'multiselect',
    'login/login_service',
    'login/login_model',
    'reporting/brands/brands_model',
    'common/services/data_service',
    'common/services/role_based_service',
    'common/services/constants_service',
    'common/directives/common_directives',
    'reporting/controllers/gantt_chart_controller',
    'reporting/dashboard/dashboard_controller',
    'reporting/brands/brands_controller',
    'common/controllers/header_controller',
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
    'reporting/controllers/campaign_details_controller',
    'common/controllers/popup_msg_controller',
    'common/account_change_controller',
    'common/popup_msg',
    'common/moment_utils',
    'workflow/controllers/campaign_create_controller',
    'reporting/collectiveReport/reports_schedule_list_controller',
    'reporting/collectiveReport/collective_report_listing_controller',
    'highcharts',
    'highcharts-ng',
    'highcharts-more'
], function (angularAMD) {
    'use strict';
    return angularAMD;
});
