// `main.js` is the file that sbt-web will use as an entry point
(function (requirejs) {
  'use strict';
  // -- RequireJS config --
  requirejs.config({
    // Packages = top-level folders; loads a contained file named 'main.js"
    packages: ['brands', 'campaignList', 'campaignSelect','strategySelect', 'kpiSelect','common', 'controllers', 'dashboard', 'directives', 'editActions', 'login', 'models', 'services', 'timePeriod','tmp'],

    shim: {
      'jsRoutes': {
        deps: [],
        // it's not a RequireJS module, so we have to tell it what var is returned
        exports: 'jsRoutes'
      },
      'jquery': {exports:'jquery'},
      'jquery-ui': {deps: ['jquery']},
      'bootstrap': {deps: ['jquery-ui']},
        'angular': {
            deps: ['bootstrap'],
            exports: 'angular'
        },
      'angular-cache': {deps: ['angular']},
      'angular-switch': {deps: ['angular']},
      'angular-css': {deps: ['angular']},
      'date-picker': {deps: ['jquery', 'bootstrap']},
      'bootstrap-toggle': {deps: ['jquery', 'bootstrap']},
      'angular-cookies': {deps: ['angular-cache']},
      'angular-resource': {deps: ['angular-cookies']},
      'angular-route': {deps: ['angular-resource']},
      'tmhDynamicLocale'   : {deps: ['angular']},
      'ng-infinite-scroll': {deps: ['angular-route']},
      'highcharts-ng': {deps: ['ng-infinite-scroll']},
      'highcharts': {deps: ['highcharts-ng']},
      'highcharts-more': {deps: ['highcharts']},
      'solid-gauge': {deps: ['highcharts-more']},

      'ng-file-upload-shim': {deps: []},
      'ng-file-upload': {deps: ['angular']},

      'underscore': {deps: []},
      'angulartics': {deps: ['angular']},
      'angulartics-ga': {deps: ['angulartics']},
      'd3': {deps: ['angulartics-ga']},
      'angular-sanitize': {deps: ['d3']},
      'filesaver': {deps: ['angular-sanitize']},
      'ui-bootstrap-tpls': {deps: ['filesaver']},
      'lrInfiniteScroll': {deps: ['ui-bootstrap-tpls']},
      'jquer_table_sorter_scroller' : {deps: ['ui-bootstrap-tpls']},
      'app': {deps: ['lrInfiniteScroll']},
      'CommonModule': {deps: ['app']},
      'common-charts-line':{deps: ['CommonModule']},
      'common-charts-actions':{deps: ['common-charts-line']},
      'common-charts-columnline':{deps: ['common-charts-actions']},
      'common-charts-piechart':{deps: ['common-charts-columnline']},
      'common-charts-solidgauge':{deps: ['common-charts-piechart']},

      'common-services-DataService':{deps: ['common-charts-solidgauge']},
      'common-services-TransformerService':{deps: ['common-services-DataService']},
      'common-services-ConstantsService':{deps: ['common-services-TransformerService']},
      'common-services-RequestCancelService':{deps: ['common-services-ConstantsService']},
      'common-services-UrlService':{deps: ['common-services-RequestCancelService']},
      'common-models-CampaignCDBData':{deps: ['common-services-UrlService']},
      'common-models-CampaignCost':{deps: ['common-models-CampaignCDBData']},
      'common-models-CampaignModel':{deps: ['common-models-CampaignCost']},
      'common-models-DataStoreModel':{deps: ['common-models-CampaignModel']},
      'common-controllers-HeaderController':{deps: ['common-models-DataStoreModel']},
      'common-controllers-ConfirmationModalController':{deps:['CommonModule']},
      'common-directives-CommonDirectives':{deps: ['common-controllers-HeaderController']},
      'common-utils':{deps: ['common-directives-CommonDirectives']},
      'common-pop_up_msg':{deps:['CommonModule']},
      'common-services-AnalyticsService':{deps: ['common-utils']},
      'common-d3-gauge':{deps: ['common-services-AnalyticsService']},
      'common-d3-quartilesGraph':{deps: ['common-services-AnalyticsService']},
      'common-d3-campaignChart':{deps: ['common-services-AnalyticsService']},
      'common-d3-barChart':{deps: ['common-services-AnalyticsService']},
      'common-d3-pieChart':{deps: ['common-services-AnalyticsService']},
      'common-controllers-GaugeController':{deps: ['common-d3-gauge']},
      'common-models-GaugeModel':{deps: ['common-controllers-GaugeController']},
      'common-d3-bubbleChart':{deps: ['common-models-GaugeModel']},
      'common-controllers-BubbleChartController':{deps: ['common-d3-bubbleChart']},
      'common-models-BubbleChartModel':{deps: ['common-controllers-BubbleChartController']},
      'common-d3-screenChart':{deps: ['common-models-BubbleChartModel']},
      'common-controllers-ScreenChartController':{deps: ['common-d3-screenChart']},
      'common-models-ScreenChartModel':{deps: ['common-controllers-ScreenChartController']},

      'common-d3-ganttChart':{deps: ['common-models-ScreenChartModel']},
      'common-controllers-GanttChartController':{deps: ['common-d3-ganttChart']},
      'common-models-GanttChartModel':{deps: ['common-controllers-GanttChartController']},

      'dashboard-DashboardModule':{deps: ['common-models-GanttChartModel']},
      'dashboard-DashboardModel':{deps: ['dashboard-DashboardModule']},
      'dashboard-DashboardController':{deps: ['dashboard-DashboardModel']},


      'campaignList-CampaignListModule':{deps: ['dashboard-DashboardController']},
      'campaignList-CampaignListModel':{deps: ['campaignList-CampaignListModule']},
      'campaignList-CampaignListService':{deps: ['campaignList-CampaignListModel']},
      'campaignList-CampaignListController':{deps: ['campaignList-CampaignListService']},
      'campaignList-CampaignListFilterDirective':{deps: ['campaignList-CampaignListModule']},
      'workflow-controllers-CampaignListController':{deps: ['campaignList-CampaignListService']},


      'editActions-EditActionsModule':{deps: ['campaignList-CampaignListController']},
      'editActions-EditActionsModel':{deps: ['editActions-EditActionsModule']},
      'editActions-EditActionsService':{deps: ['editActions-EditActionsModel']},
      'editActions-EditActionsController':{deps: ['editActions-EditActionsService']},

      'brands-BrandsModule':{deps: ['editActions-EditActionsController']},
      'brands-BrandsController':{deps: ['brands-BrandsModule']},
      'brands-BrandsListController':{deps: ['brands-BrandsController']},
      'brands-BrandsDirective':{deps: ['brands-BrandsListController']},
      'brands-BrandsService':{deps: ['brands-BrandsDirective']},
      'brands-BrandsModel':{deps: ['brands-BrandsService']},



        'advertiser-AdvertiserModule':{deps: ['editActions-EditActionsController']},
        'advertiser-AdvertiserController':{deps: ['brands-BrandsModule']},
        'advertiser-AdvertiserListController':{deps: ['advertiser-AdvertiserController']},
        'advertiser-AdvertiserDirective':{deps: ['editActions-EditActionsController']},
        'advertiser-AdvertiserService':{deps: ['advertiser-AdvertiserDirective']},
        'advertiser-AdvertiserModel':{deps: ['advertiser-AdvertiserService']},




      'campaignSelect-CampaignSelectModule':{deps: ['brands-BrandsModel']},
      'campaignSelect-CampaignSelectDirective':{deps: ['campaignSelect-CampaignSelectModule']},
      'campaignSelect-CampaignSelectModel':{deps: ['campaignSelect-CampaignSelectDirective']},
      'campaignSelect-CampaignSelectController':{deps: ['campaignSelect-CampaignSelectModel']},

      'strategySelect-StrategySelectModule':{deps: ['campaignSelect-CampaignSelectController']},
      'strategySelect-StrategySelectDirective':{deps: ['strategySelect-StrategySelectModule']},
      'strategySelect-StrategySelectModel':{deps: ['strategySelect-StrategySelectDirective']},
      'strategySelect-StrategySelectController':{deps: ['strategySelect-StrategySelectModel']},

      'kpiSelect-KpiSelectModule':{deps: ['campaignSelect-CampaignSelectController']},
      'kpiSelect-KpiSelectDirective':{deps: ['kpiSelect-KpiSelectModule']},
      'kpiSelect-KpiSelectModel':{deps: ['kpiSelect-KpiSelectDirective']},
      'kpiSelect-KpiSelectController':{deps: ['kpiSelect-KpiSelectModel']},

      'timePeriod-TimePeriodModule':{deps: ['brands-BrandsModel']},
      'timePeriod-TimePeriodModel':{deps: ['timePeriod-TimePeriodModule']},
      'timePeriod-TimePeriodDirective':{deps: ['timePeriod-TimePeriodModel']},
      'timePeriod-TimePeriodController':{deps: ['timePeriod-TimePeriodDirective']},

      'login-LoginModule':{deps: ['timePeriod-TimePeriodController']},
      'login-LoginModel':{deps: ['login-LoginModule']},
      'login-LoginService':{deps: ['login-LoginModel']},
      'login-LoginController':{deps: ['login-LoginService']},
      'common-services-RoleBasedService' :  {deps: ['login-LoginService']},//roleBased
      'controllers-campaign_details_controller':{deps: ['login-LoginController']},
      'controllers-campaign_create_controller':{deps: ['controllers-campaign_details_controller']},
      'controllers-help_controller':{deps: ['controllers-campaign_details_controller']},
      'controllers-campaign_overview_controller': {deps: ['controllers-campaign_create_controller']},
      'controllers-campaign_adcreate_controller': {deps: ['controllers-campaign_overview_controller']},
      'controllers-geo_targetting_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-audience_targetting_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-daypart_create_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-creative_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-buying_platform_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-creative_list_controller': {deps: ['controllers-creative_controller']},
      'controllers-accounts_controller': {deps: ['controllers-campaign_details_controller']},
      'controllers-users_controller': {deps: ['controllers-campaign_details_controller']},
      'controllers-actions_controller': {deps: ['controllers-creative_list_controller']},
      'controllers-optimization_controller':{deps: ['controllers-actions_controller']},
      'controllers-inventory_controller':{deps: ['controllers-optimization_controller']},
      'controllers-viewability_controller':{deps: ['controllers-inventory_controller']},
      'controllers-cost_controller':{deps: ['controllers-viewability_controller']},
      'controllers-performance_controller':{deps: ['controllers-cost_controller']},
      'controllers-platform_controller' : {deps: ['controllers-cost_controller']},
      'controllers-custom_report_controller' : {deps: ['controllers-cost_controller']},
      'controllers-accounts_add_or_edit_advertiser' : {deps: ['controllers-cost_controller']},
      'controllers-accounts_add_or_edit_brand' : {deps: ['controllers-cost_controller']},
      'controllers-accounts_add_or_edit' : {deps: ['controllers-cost_controller']},
      'controllers-users_add_or_edit' : {deps: ['controllers-cost_controller']},

      'controllers-custom_report_upload_controller': {deps: ['controllers-custom_report_controller']},

      'directives-strategycard':{deps: ['controllers-performance_controller']},
      'directives-tacticcard':{deps: ['directives-strategycard']},
      'directives-campaigncard':{deps: ['directives-tacticcard']},
      'directives-campaigncostcard':{deps: ['directives-campaigncard']},
      'directives-campaignsort':{deps: ['directives-campaigncostcard']},
      'directives-campaignlistsort':{deps: ['directives-campaignsort']},
      'directives-campaigncostsort':{deps: ['directives-campaignlistsort']},
      'directives-campaigndashboard':{deps: ['directives-campaigncostsort']},
     // 'directives-reportfilters':{deps: ['directives-campaigndashboard']},
     // 'directives-strategylist':{deps: ['directives-reportfilters']},
      'multiselect':{deps: ['directives-campaigndashboard']},
      'models-domain_reports':{deps: ['multiselect']},
      'models-action_type':{deps: ['models-domain_reports']},
      'models-activity_list':{deps: ['models-action_type']},
      'models-action_sub_type':{deps: ['models-activity_list']},
      'models-tactic':{deps: ['models-action_sub_type']},
      'models-reports_upload_list':{deps: ['models-action_sub_type']},
      'services-inventoryservice':{deps: ['models-tactic']},
      'services-viewablityservice':{deps: ['services-inventoryservice']},
      'services-performanceservice':{deps: ['services-viewablityservice']},
      'services-costservice':{deps: ['services-performanceservice']},
      'services-workflowservice':{deps: ['services-costservice']},
       'services-accountservice':{deps: ['services-costservice']},
      'services-audienceservice':{deps: ['services-costservice']},
      'services-platform_custome_module':{deps: ['services-costservice']},
      'directives-showerrors':{deps: ['services-workflowservice']},
      'directives-creativedropdown':{deps: ['services-workflowservice']},
      'directives-customdatepicker':{deps: ['services-workflowservice']},
      'directives-clearrow':{deps: ['services-workflowservice']},
      'directives-ngupdatehiddendropdown':{deps: ['services-workflowservice']},
      'directives-nguploadhidden':{deps: ['services-workflowservice']},
      'services-optimizationservice':{deps: ['directives-showerrors']},
      'services-platformservice':{deps: ['services-optimizationservice']},
      'services-momentService': {deps: ['login-LoginModel']},
      'common-directive-DataNotFound':{deps:['CommonModule']},
      'common-services-zipCode' : {deps:['CommonModule']},
      'collectiveReport-CollectiveReportModule':{deps: ['angular']},
      'collectiveReport-collective_report_listing_controller':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-reports_schedule_list_controller':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-ReportScheduleDeleteController':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-CollectiveReportModel':{deps: ['collectiveReport-CollectiveReportModule']},
      //'collectiveReport-CollectiveReportDirective':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-collective_edit_report_controller':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-CollectiveDeleteReportController':{deps: ['collectiveReport-CollectiveReportModule']}


    },
    optimize: 'uglify2',
    uglify2: {
    warnings: false,
      mangle: false
    },
    paths: {
      'requirejs': 'vendor/require.min',
      'jquery': 'vendor/jquery.min',
      'jquery-ui': 'vendor/jquery-ui.min',
      'angular': 'vendor/angular.min',
      'angular-resource': 'vendor/angular-resource.min',
      'angular-route': 'vendor/angular-route.min',
      'tmhDynamicLocale': 'vendor/tmhDynamicLocale.min',
      'angular-switch':'vendor/angular-ui-switch.min',
      'angular-css':'vendor/angular-css.min',
      'angular-cookies': 'vendor/angular-cookies',
      'angular-cache': 'vendor/angular-cache-2.3.7',
      'angular-sanitize': 'vendor/angular-sanitize',
      'angulartics': 'vendor/angulartics',
      'angulartics-ga': 'vendor/angulartics-ga',
      'bootstrap': 'vendor/bootstrap.min',
      'highcharts': 'vendor/highcharts',
      'highcharts-ng': 'vendor/highcharts-ng',
      'highcharts-more': 'vendor/highcharts-more',
      'date-picker': 'vendor/datePicker',
      'bootstrap-toggle': 'vendor/bootstrap-toggle.min',
      'solid-gauge': 'vendor/solid-gauge',
      'moment': 'vendor/moment.min.2.8.3',
      'moment-tz': 'vendor/moment-timezone-with-data-2010-2020',
      'ng-file-upload': 'vendor/ng-file-upload',
      'ng-file-upload-shim': 'vendor/ng-file-upload-shim',
      'underscore': 'vendor/underscore-min',
      'ng-infinite-scroll': 'vendor/ng-infinite-scroll.min',
      'lrInfiniteScroll': 'vendor/lrInfiniteScroll',
      'jquer_table_sorter_scroller' : 'vendor/jquer_table_sorter_scroller',
      'ui-bootstrap-tpls': 'vendor/ui-bootstrap-tpls-0.12.1.min',
      'd3': 'vendor/d3',
      'filesaver': 'vendor/filesaver',
      'app': 'app',
      'CommonModule': 'common/CommonModule',
      'common-charts-line':'reporting/common/charts/line',
      'common-charts-actions':'reporting/common/charts/actions',
      'common-charts-columnline':'reporting/common/charts/columnline',
      'common-charts-piechart':'reporting/common/charts/piechart',
      'common-charts-solidgauge':'reporting/common/charts/solidgauge',
      'common-services-DataService':'common/services/DataService',
      'common-services-TransformerService':'common/services/TransformerService',
      'common-services-ConstantsService':'common/services/ConstantsService',
      'common-services-RequestCancelService':'common/services/RequestCancelService',
      'common-services-UrlService':'common/services/UrlService',
      'common-models-CampaignCDBData':'reporting/common/models/CampaignCDBData',
      'common-models-CampaignCost':'reporting/common/models/CampaignCost',
      'common-models-CampaignModel':'reporting/common/models/CampaignModel',
      'common-models-DataStoreModel':'reporting/common/models/DataStoreModel',
      'common-controllers-HeaderController':'reporting/common/controllers/HeaderController',
      'common-controllers-ConfirmationModalController':'reporting/common/controllers/ConfirmationModalController',
      'common-directives-CommonDirectives':'common/directives/CommonDirectives',
      'common-utils':'common/utils',
      'common-pop_up_msg':'common/popup_msg',
      'common-services-AnalyticsService':'common/services/AnalyticsService',
      'common-d3-gauge':'reporting/common/d3/gauge',
      'common-d3-quartilesGraph':'reporting/common/d3/quartilesGraph',
      'common-d3-campaignChart':'reporting/common/d3/campaignChart',
      'common-d3-barChart':'reporting/common/d3/barChart',
      'common-d3-pieChart':'reporting/common/d3/pieChart',
      'common-controllers-GaugeController':'reporting/common/controllers/GaugeController',
      'common-models-GaugeModel':'reporting/common/models/GaugeModel',
      'common-d3-bubbleChart':'reporting/common/d3/bubbleChart',
      'common-controllers-BubbleChartController':'reporting/common/controllers/BubbleChartController',
      'common-models-BubbleChartModel':'reporting/common/models/BubbleChartModel',
      'common-d3-screenChart':'reporting/common/d3/screenChart',
      'common-controllers-ScreenChartController':'reporting/common/controllers/ScreenChartController',
      'common-models-ScreenChartModel':'reporting/common/models/ScreenChartModel',

      'common-d3-ganttChart':'reporting/common/d3/ganttChart',
      'common-controllers-GanttChartController':'reporting/common/controllers/GanttChartController',
      'common-models-GanttChartModel':'reporting/common/models/GanttChartModel',

      'dashboard-DashboardModule':'reporting/dashboard/DashboardModule',
      'dashboard-DashboardModel':'reporting/dashboard/DashboardModel',
      'dashboard-DashboardController':'reporting/dashboard/DashboardController',

      'campaignList-CampaignListModule':'reporting/campaignList/CampaignListModule',
      'campaignList-CampaignListModel':'reporting/campaignList/CampaignListModel',
      'campaignList-CampaignListService':'reporting/campaignList/CampaignListService',
      'campaignList-CampaignListController':'reporting/campaignList/CampaignListController',
      'campaignList-CampaignListFilterDirective':'reporting/campaignList/CampaignListFilterDirective',
      'workflow-controllers-CampaignListController':'workflow/controllers/CampaignListController',


      'editActions-EditActionsModule':'reporting/editActions/EditActionsModule',
      'editActions-EditActionsModel':'reporting/editActions/EditActionsModel',
      'editActions-EditActionsService':'reporting/editActions/EditActionsService',
      'editActions-EditActionsController':'reporting/editActions/EditActionsController',

      'brands-BrandsModule':'reporting/brands/BrandsModule',
      'brands-BrandsController':'reporting/brands/BrandsController',
      'brands-BrandsListController':'reporting/brands/BrandsListController',
      'brands-BrandsDirective':'reporting/brands/BrandsDirective',
      'brands-BrandsService':'reporting/brands/BrandsService',
      'brands-BrandsModel':'reporting/brands/BrandsModel',

      'advertiser-AdvertiserDirective':'reporting/advertiser/AdvertiserDirective',
      'advertiser-AdvertiserModule':'reporting/advertiser/AdvertiserModule',
      'advertiser-AdvertiserController':'reporting/advertiser/AdvertiserController',
      'advertiser-AdvertiserListController':'reporting/advertiser/AdvertiserListController',

      'advertiser-AdvertiserService':'reporting/advertiser/AdvertiserService',
      'advertiser-AdvertiserModel':'reporting/advertiser/AdvertiserModel',

      'campaignSelect-CampaignSelectModule':'reporting/campaignSelect/CampaignSelectModule',
      'campaignSelect-CampaignSelectController':'reporting/campaignSelect/CampaignSelectController',
      'campaignSelect-CampaignSelectDirective':'reporting/campaignSelect/CampaignSelectDirective',
      'campaignSelect-CampaignSelectModel':'reporting/campaignSelect/CampaignSelectModel',

      'strategySelect-StrategySelectModule':'reporting/strategySelect/StrategySelectModule',
      'strategySelect-StrategySelectController':'reporting/strategySelect/StrategySelectController',
      'strategySelect-StrategySelectDirective':'reporting/strategySelect/StrategySelectDirective',
      'strategySelect-StrategySelectModel':'reporting/strategySelect/StrategySelectModel',

      'kpiSelect-KpiSelectModule':'reporting/kpiSelect/KpiSelectModule',
      'kpiSelect-KpiSelectController':'reporting/kpiSelect/KpiSelectController',
      'kpiSelect-KpiSelectDirective':'reporting/kpiSelect/KpiSelectDirective',
      'kpiSelect-KpiSelectModel':'reporting/kpiSelect/KpiSelectModel',

      'timePeriod-TimePeriodModule':'reporting/timePeriod/TimePeriodModule',
      'timePeriod-TimePeriodModel':'reporting/timePeriod/TimePeriodModel',
      'timePeriod-TimePeriodDirective':'reporting/timePeriod/TimePeriodDirective',
      'timePeriod-TimePeriodController':'reporting/timePeriod/TimePeriodController',

      'login-LoginModule':'login/LoginModule',
      'login-LoginModel':'login/LoginModel',
      'login-LoginService':'login/LoginService',
      'login-LoginController':'login/LoginController',

      'collectiveReport-CollectiveReportModule':'reporting/collectiveReport/CollectiveReportModule',
      'collectiveReport-collective_report_listing_controller':'reporting/collectiveReport/collective_report_listing_controller',
      'collectiveReport-reports_schedule_list_controller':'reporting/collectiveReport/reports_schedule_list_controller',
      'collectiveReport-ReportScheduleDeleteController':'reporting/collectiveReport/ReportScheduleDeleteController',
      'collectiveReport-CollectiveReportModel':'reporting/collectiveReport/CollectiveReportModel',
      //'collectiveReport-CollectiveReportDirective':'collectiveReport/CollectiveReportDirective',
      'collectiveReport-collective_edit_report_controller':'reporting/collectiveReport/collective_edit_report_controller',
      'collectiveReport-CollectiveDeleteReportController':'reporting/collectiveReport/CollectiveDeleteReportController',


      'controllers-campaign_details_controller':'reporting/controllers/campaign_details_controller',
      'controllers-help_controller':'reporting/controllers/help_controller',
      'controllers-campaign_create_controller':'workflow/controllers/campaign_create_controller',
      'controllers-campaign_overview_controller':'workflow/controllers/campaign_overview_controller',
      'controllers-campaign_adcreate_controller':'workflow/controllers/campaign_adcreate_controller',
      'controllers-buying_platform_controller':'workflow/controllers/buying_platform_controller',
      'controllers-geo_targetting_controller' : 'workflow/controllers/geo_targetting_controller',
      'controllers-audience_targetting_controller' : 'workflow/controllers/audience_targetting_controller',
      'controllers-daypart_create_controller' : 'workflow/controllers/daypart_create_controller',

        'controllers-creative_controller':'workflow/controllers/creative_controller',
      'controllers-creative_list_controller':'workflow/controllers/creative_list_controller',
      'controllers-accounts_add_or_edit_advertiser':'workflow/controllers/accounts_add_or_edit_advertiser',
      'controllers-accounts_add_or_edit_brand':'workflow/controllers/accounts_add_or_edit_brand',
      'controllers-accounts_add_or_edit':'workflow/controllers/accounts_add_or_edit',
      'controllers-users_add_or_edit':'reporting/controllers/users_add_or_edit',
      'controllers-accounts_controller':'workflow/controllers/accounts_controller',
      'controllers-users_controller':'reporting/controllers/users_controller',
      'controllers-actions_controller':'reporting/controllers/actions_controller',
      'controllers-optimization_controller':'reporting/controllers/optimization_controller',
      'controllers-inventory_controller':'reporting/controllers/inventory_controller',
      'controllers-viewability_controller':'reporting/controllers/viewability_controller',
      'controllers-cost_controller':'reporting/controllers/cost_controller',
      'controllers-performance_controller':'reporting/controllers/performance_controller',
      'controllers-platform_controller':'reporting/controllers/platform_controller',
      'controllers-custom_report_controller':'reporting/controllers/custom_report_controller',

      'controllers-custom_report_upload_controller':'reporting/controllers/custom_report_upload_controller',

      'directives-strategycard':'reporting/directives/strategycard',
      'directives-tacticcard':'reporting/directives/tacticcard',
      'directives-campaigncard':'reporting/directives/campaigncard',
      'directives-campaigncostcard':'reporting/directives/campaigncostcard',
      'directives-campaignsort':'reporting/directives/campaignsort',
      'directives-campaignlistsort':'reporting/directives/campaignlistsort',
      'directives-campaigncostsort':'reporting/directives/campaigncostsort',
      'directives-campaigndashboard':'reporting/directives/campaigndashboard',

      'multiselect':'multiselect',
      'models-domain_reports':'reporting/models/domain_reports',
      'models-action_type':'reporting/models/action_type',
      'models-activity_list':'reporting/models/activity_list',
      'models-action_sub_type':'reporting/models/action_sub_type',
      'models-tactic':'reporting/models/tactic',
      'models-reports_upload_list':'reporting/models/reports_upload_list',
      'services-inventoryservice':'reporting/services/inventoryservice',
      'services-viewablityservice':'reporting/services/viewablityservice',
      'services-performanceservice':'reporting/services/performanceservice',
      'services-platformservice':'reporting/services/platformservice',
      'services-costservice':'reporting/services/costservice',
      'services-workflowservice':'workflow/services/workflowservice',
      'services-accountservice':'workflow/services/accountservice',
      'services-audienceservice':'workflow/services/audienceservice',
      'services-platform_custome_module':'workflow/services/platform_custome_module',
      'directives-showerrors':'workflow/directives/showerrors',
      'directives-creativedropdown':'workflow/directives/creative_drop_down',
      'directives-customdatepicker':'workflow/directives/custom_date_picker',
      'directives-clearrow':'workflow/directives/clear_row',
      'directives-ngupdatehiddendropdown':'workflow/directives/ng_update_hidden_dropdown',
      'directives-nguploadhidden':'workflow/directives/ng_upload_hidden',
      'services-optimizationservice':'reporting/services/optimizationservice',
      'services-momentService': 'common/MomentUtils',
      'common-directive-DataNotFound':'common/directives/DataNotFound',
      'common-services-zipCode' : 'common/services/zipCode',
      'jsRoutes': '/jsroutes',
      'common-services-RoleBasedService':'common/services/RoleBasedService' //roleBased
    }

  });

  requirejs.onError = function (err) {
    //console.log(err);
  };

  // Load the app. This is kept minimal so it doesn't need much updating.
  require([
          'jquery',
          'jquery-ui',
           'bootstrap',
          'angular',
          'angular-switch',
          'angular-css',
          'angular-resource',
          'tmhDynamicLocale',
          'angular-cookies',
          'angular-cache',
          'ng-infinite-scroll',
           'highcharts',
           'date-picker',
           'bootstrap-toggle',
           'highcharts-ng',
           'highcharts-more',
           'solid-gauge',
           'moment',
           'moment-tz',
           'ng-file-upload-shim',
           'ng-file-upload',
           'underscore',
           'angulartics',
           'angulartics-ga',
           'd3',
           'angular-sanitize',
           'filesaver',
           'ui-bootstrap-tpls',
           'lrInfiniteScroll',
           'jquer_table_sorter_scroller',
           'app',
           'CommonModule',
           'common-charts-line',
           'common-charts-actions',
           'common-charts-columnline',
           'common-charts-piechart',
           'common-charts-solidgauge',
           'common-services-DataService',
           'common-services-TransformerService',
           'common-services-ConstantsService',
           'common-services-RequestCancelService',
           'common-services-UrlService',
           'common-models-CampaignCDBData',
           'common-models-CampaignCost',
           'common-models-CampaignModel',
           'common-models-DataStoreModel',
           'common-controllers-HeaderController',
           'common-controllers-ConfirmationModalController',
           'common-directives-CommonDirectives',
           'common-utils',
           'common-pop_up_msg',
           'common-services-AnalyticsService',
           'common-d3-gauge',
           'common-d3-quartilesGraph',
           'common-d3-campaignChart',
           'common-d3-barChart',
           'common-d3-pieChart',
           'common-controllers-GaugeController',
           'common-models-GaugeModel',
           'common-d3-bubbleChart',
           'common-controllers-BubbleChartController',
           'common-models-BubbleChartModel',
           'common-d3-screenChart',
           'common-controllers-ScreenChartController',
           'common-models-ScreenChartModel',

           'common-d3-ganttChart',
           'common-controllers-GanttChartController',
           'common-models-GanttChartModel',

           'dashboard-DashboardModule',
           'dashboard-DashboardModel',
           'dashboard-DashboardController',


           'campaignList-CampaignListModule',
           'campaignList-CampaignListModel',
           'campaignList-CampaignListService',
           'campaignList-CampaignListController',
           'campaignList-CampaignListFilterDirective',
           'workflow-controllers-CampaignListController',


           'editActions-EditActionsModule',
           'editActions-EditActionsModel',
           'editActions-EditActionsService',
           'editActions-EditActionsController',

           'brands-BrandsModule',
           'brands-BrandsController',
           'brands-BrandsListController',
           'brands-BrandsDirective',
           'brands-BrandsService',
           'brands-BrandsModel',



          'advertiser-AdvertiserDirective',

          'advertiser-AdvertiserModule',
           'advertiser-AdvertiserController',
           'advertiser-AdvertiserListController',

           'advertiser-AdvertiserService',
           'advertiser-AdvertiserModel',


          'campaignSelect-CampaignSelectModule',
          'campaignSelect-CampaignSelectController',
          'campaignSelect-CampaignSelectDirective',
          'campaignSelect-CampaignSelectModel',

          'strategySelect-StrategySelectModule',
          'strategySelect-StrategySelectController',
          'strategySelect-StrategySelectDirective',
          'strategySelect-StrategySelectModel',

          'kpiSelect-KpiSelectModule',
          'kpiSelect-KpiSelectController',
          'kpiSelect-KpiSelectDirective',
          'kpiSelect-KpiSelectModel',

           'timePeriod-TimePeriodModule',
           'timePeriod-TimePeriodModel',
           'timePeriod-TimePeriodDirective',
           'timePeriod-TimePeriodController',

           'login-LoginModule',
           'login-LoginModel',
           'login-LoginService',
           'login-LoginController',

           'controllers-campaign_details_controller',
           'controllers-help_controller',
           'controllers-campaign_create_controller',
           'controllers-campaign_overview_controller',
           'controllers-campaign_adcreate_controller',
           'controllers-buying_platform_controller',
           'controllers-geo_targetting_controller',
          'controllers-audience_targetting_controller',
          'controllers-daypart_create_controller',


           'controllers-creative_controller',
           'controllers-creative_list_controller',
           'controllers-accounts_add_or_edit_advertiser',
           'controllers-accounts_add_or_edit_brand',
           'controllers-accounts_add_or_edit',
           'controllers-users_add_or_edit',
           'controllers-accounts_controller',
           'controllers-users_controller',
           'controllers-actions_controller',
           'controllers-optimization_controller',
           'controllers-inventory_controller',
           'controllers-viewability_controller',
           'controllers-cost_controller',
           'controllers-performance_controller',
           'controllers-platform_controller',
           'controllers-custom_report_controller',

           'controllers-custom_report_upload_controller',

           'directives-strategycard',
           'directives-tacticcard',
           'directives-campaigncard',
           'directives-campaigncostcard',
           'directives-campaignsort',
           'directives-campaignlistsort',
           'directives-campaigncostsort',
           'directives-campaigndashboard',
           'multiselect',
           'models-domain_reports',
           'models-action_type',
           'models-activity_list',
           'models-action_sub_type',
           'models-tactic',
           'models-reports_upload_list',
           'services-inventoryservice',
           'services-viewablityservice',
           'services-performanceservice',
           'services-platformservice',
           'services-costservice',
           'services-workflowservice',
          'services-accountservice',
          'services-audienceservice',
          'services-platform_custome_module',
          'directives-showerrors',
          'directives-creativedropdown',
          'directives-customdatepicker',
          'directives-clearrow',
          'directives-ngupdatehiddendropdown',
          'directives-nguploadhidden',
          'services-optimizationservice',
          'services-momentService',
          'common-directive-DataNotFound',
          'collectiveReport-CollectiveReportModule',
          'collectiveReport-collective_report_listing_controller',
          'collectiveReport-reports_schedule_list_controller',
          'collectiveReport-ReportScheduleDeleteController',
          'collectiveReport-CollectiveReportModel',
          'collectiveReport-collective_edit_report_controller',
          'collectiveReport-CollectiveDeleteReportController',
          'common-services-zipCode',
          'common-services-RoleBasedService'//roleBased
           ],

    function ($,jqueryUI,  bootstrap, angular) {
            angular.bootstrap(document, ['app']);
    }
  );
})(requirejs);
