define(['angularAMD','angular-route', 'angular-resource', 'angular-cookies', 'angular-cache',
  'tmhDynamicLocale', 'underscore', 'angular-css', 'd3', 'angular-sanitize',
  'date-picker', 'filesaver', 'ui-bootstrap-tpls', 'ng-file-upload', 'ng-file-upload-shim', 'moment', 'moment-tz',
    'common/directives/common_directives',
    'common/controllers/header_controller',
    'common/controllers/popup_msg_controller',
    'common/moment_utils', 'reporting/brands/brands_model',
    'common/services/data_service',
    'common/popup_msg',
    'workflow/services/workflow_service',
    'reporting/controllers/gantt_chart_controller',
    'reporting/advertiser/advertiser_controller',
    'reporting/brands/brands_controller',
    'reporting/common/d3/gauge',
    'reporting/advertiser/advertiser_directive',
    'reporting/brands/brands_directive',

  'reporting/common/d3/gauge_directive',
  'reporting/controllers/bubble_chart_controller',

  'reporting/common/d3/screen_chart',
  'reporting/common/d3/bar_chart',
  'reporting/controllers/screen_chart_controller',
  'reporting/common/d3/gantt_directive',
    'reporting/advertiser/advertiser_model',
    'reporting/campaignList/campaign_list_controller',
    'reporting/models/domain_reports',
    'reporting/timePeriod/time_period_controller',
    'reporting/timePeriod/time_period_pick_controller',

    'reporting/controllers/campaign_details_controller',
    'workflow/controllers/campaign_create_controller',
    'workflow/controllers/get_adgroups_controller',
    'workflow/controllers/create_adGroups_controller',
    'workflow/controllers/budget_delivery_controller',
    'workflow/controllers/buying_platform_controller',



], function (angularAMD) {
  'use strict';
  return angularAMD;
});
