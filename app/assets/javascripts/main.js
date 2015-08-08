// `main.js` is the file that sbt-web will use as an entry point
(function (requirejs) {
  'use strict';
  // -- RequireJS config --
  requirejs.config({
    // Packages = top-level folders; loads a contained file named 'main.js"
    packages: ['brands', 'campaignList', 'campaignSelect', 'strategySelect', 'kpiSelect','common', 'controllers', 'dashboard', 'directives', 'editActions', 'login', 'models', 'services', 'timePeriod','tmp'],

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
      'date-picker': {deps: ['jquery', 'bootstrap']},
      'angular-cookies': {deps: ['angular-cache']},
      'angular-resource': {deps: ['angular-cookies']},
      'angular-route': {deps: ['angular-resource']},
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
      'angular-locale' : {deps:['angular']},
      'angular-sanitize': {deps: ['d3']},
      'filesaver': {deps: ['angular-sanitize']},
      'ui-bootstrap-tpls': {deps: ['filesaver']},
      'lrInfiniteScroll': {deps: ['ui-bootstrap-tpls']},
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
      'common-directives-CommonDirectives':{deps: ['common-controllers-HeaderController']},
      'common-utils':{deps: ['common-directives-CommonDirectives']},
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

      'controllers-campaign_details_controller':{deps: ['login-LoginController']},
      'controllers-campaign_create_controller':{deps: ['controllers-campaign_details_controller']},
      'controllers-campaign_overview_controller': {deps: ['controllers-campaign_create_controller']},
      'controllers-campaign_adcreate_controller': {deps: ['controllers-campaign_overview_controller']},
      'controllers-creative_controller': {deps: ['controllers-campaign_adcreate_controller']},
      'controllers-creative_list_controller': {deps: ['controllers-creative_controller']},
      'controllers-actions_controller': {deps: ['controllers-creative_list_controller']},
      'controllers-optimization_controller':{deps: ['controllers-actions_controller']},
      'controllers-inventory_controller':{deps: ['controllers-optimization_controller']},
      'controllers-viewability_controller':{deps: ['controllers-inventory_controller']},
      'controllers-cost_controller':{deps: ['controllers-viewability_controller']},
      'controllers-performance_controller':{deps: ['controllers-cost_controller']},
      'controllers-platform_controller' : {deps: ['controllers-cost_controller']},
      'controllers-custom_report_controller' : {deps: ['controllers-cost_controller']},

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
  //     'directives-strategylist':{deps: ['directives-reportfilters']},
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
      'directives-showerrors':{deps: ['services-workflowservice']},
      'services-optimizationservice':{deps: ['directives-showerrors']},
      'services-platformservice':{deps: ['services-optimizationservice']},
      'services-momentService': {deps: ['login-LoginModel']},
      'common-directive-DataNotFound':{deps:['CommonModule']},

      'collectiveReport-CollectiveReportModule':{deps: ['angular']},
      'collectiveReport-CollectiveReportListingController':{deps: ['angular']},
      'collectiveReport-CollectiveReportModel':{deps: ['collectiveReport-CollectiveReportModule']},
      'collectiveReport-CollectiveReportDirective':{deps: ['collectiveReport-CollectiveReportModule']}

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
      'angular-switch':'vendor/angular-ui-switch.min',
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
      'solid-gauge': 'vendor/solid-gauge',
      'moment': 'vendor/moment.min.2.8.3',
      'moment-tz': 'vendor/moment-timezone-with-data-2010-2020',
      'ng-file-upload': 'vendor/ng-file-upload',
      'ng-file-upload-shim': 'vendor/ng-file-upload-shim',
      'underscore': 'vendor/underscore-min',
      'ng-infinite-scroll': 'vendor/ng-infinite-scroll.min',
      'lrInfiniteScroll': 'vendor/lrInfiniteScroll',
      'ui-bootstrap-tpls': 'vendor/ui-bootstrap-tpls-0.12.1.min',
      'd3': 'vendor/d3',
      'filesaver': 'vendor/filesaver',
      'app': 'app',
      'CommonModule': 'common/CommonModule',
      'common-charts-line':'common/charts/line',
      'common-charts-actions':'common/charts/actions',
      'common-charts-columnline':'common/charts/columnline',
      'common-charts-piechart':'common/charts/piechart',
      'common-charts-solidgauge':'common/charts/solidgauge',
      'common-services-DataService':'common/services/DataService',
      'common-services-TransformerService':'common/services/TransformerService',
      'common-services-ConstantsService':'common/services/ConstantsService',
      'common-services-RequestCancelService':'common/services/RequestCancelService',
      'common-services-UrlService':'common/services/UrlService',
      'common-models-CampaignCDBData':'common/models/CampaignCDBData',
      'common-models-CampaignCost':'common/models/CampaignCost',
      'common-models-CampaignModel':'common/models/CampaignModel',
      'common-models-DataStoreModel':'common/models/DataStoreModel',
      'common-controllers-HeaderController':'common/controllers/HeaderController',
      'common-directives-CommonDirectives':'common/directives/CommonDirectives',
      'common-utils':'common/utils',
      'common-services-AnalyticsService':'common/services/AnalyticsService',
      'common-d3-gauge':'common/d3/gauge',
      'common-d3-quartilesGraph':'common/d3/quartilesGraph',
      'common-d3-campaignChart':'common/d3/campaignChart',
      'common-d3-barChart':'common/d3/barChart',
      'common-d3-pieChart':'common/d3/pieChart',
      'common-controllers-GaugeController':'common/controllers/GaugeController',
      'common-models-GaugeModel':'common/models/GaugeModel',
      'common-d3-bubbleChart':'common/d3/bubbleChart',
      'common-controllers-BubbleChartController':'common/controllers/BubbleChartController',
      'common-models-BubbleChartModel':'common/models/BubbleChartModel',
      'common-d3-screenChart':'common/d3/screenChart',
      'common-controllers-ScreenChartController':'common/controllers/ScreenChartController',
      'common-models-ScreenChartModel':'common/models/ScreenChartModel',

      'common-d3-ganttChart':'common/d3/ganttChart',
      'common-controllers-GanttChartController':'common/controllers/GanttChartController',
      'common-models-GanttChartModel':'common/models/GanttChartModel',

      'dashboard-DashboardModule':'dashboard/DashboardModule',
      'dashboard-DashboardModel':'dashboard/DashboardModel',
      'dashboard-DashboardController':'dashboard/DashboardController',

      'campaignList-CampaignListModule':'campaignList/CampaignListModule',
      'campaignList-CampaignListModel':'campaignList/CampaignListModel',
      'campaignList-CampaignListService':'campaignList/CampaignListService',
      'campaignList-CampaignListController':'campaignList/CampaignListController',


      'editActions-EditActionsModule':'editActions/EditActionsModule',
      'editActions-EditActionsModel':'editActions/EditActionsModel',
      'editActions-EditActionsService':'editActions/EditActionsService',
      'editActions-EditActionsController':'editActions/EditActionsController',

      'brands-BrandsModule':'brands/BrandsModule',
      'brands-BrandsController':'brands/BrandsController',
      'brands-BrandsListController':'brands/BrandsListController',
      'brands-BrandsDirective':'brands/BrandsDirective',
      'brands-BrandsService':'brands/BrandsService',
      'brands-BrandsModel':'brands/BrandsModel',

      'campaignSelect-CampaignSelectModule':'campaignSelect/CampaignSelectModule',
      'campaignSelect-CampaignSelectController':'campaignSelect/CampaignSelectController',
      'campaignSelect-CampaignSelectDirective':'campaignSelect/CampaignSelectDirective',
      'campaignSelect-CampaignSelectModel':'campaignSelect/CampaignSelectModel',

      'strategySelect-StrategySelectModule':'strategySelect/StrategySelectModule',
      'strategySelect-StrategySelectController':'strategySelect/StrategySelectController',
      'strategySelect-StrategySelectDirective':'strategySelect/StrategySelectDirective',
      'strategySelect-StrategySelectModel':'strategySelect/StrategySelectModel',

      'kpiSelect-KpiSelectModule':'kpiSelect/KpiSelectModule',
      'kpiSelect-KpiSelectController':'kpiSelect/KpiSelectController',
      'kpiSelect-KpiSelectDirective':'kpiSelect/KpiSelectDirective',
      'kpiSelect-KpiSelectModel':'kpiSelect/KpiSelectModel',

      'timePeriod-TimePeriodModule':'timePeriod/TimePeriodModule',
      'timePeriod-TimePeriodModel':'timePeriod/TimePeriodModel',
      'timePeriod-TimePeriodDirective':'timePeriod/TimePeriodDirective',
      'timePeriod-TimePeriodController':'timePeriod/TimePeriodController',

      'login-LoginModule':'login/LoginModule',
      'login-LoginModel':'login/LoginModel',
      'login-LoginService':'login/LoginService',
      'login-LoginController':'login/LoginController',

      'collectiveReport-CollectiveReportModule':'collectiveReport/CollectiveReportModule',
      'collectiveReport-CollectiveReportListingController':'collectiveReport/CollectiveReportListingController',
      'collectiveReport-CollectiveReportModel':'collectiveReport/CollectiveReportModel',
      'collectiveReport-CollectiveReportDirective':'collectiveReport/CollectiveReportDirective',

      'controllers-campaign_details_controller':'controllers/campaign_details_controller',
      'controllers-campaign_create_controller':'workflow/controllers/campaign_create_controller',
      'controllers-campaign_overview_controller':'workflow/controllers/campaign_overview_controller',
      'controllers-campaign_adcreate_controller':'workflow/controllers/campaign_adcreate_controller',
      'controllers-creative_controller':'workflow/controllers/creative_controller',
      'controllers-creative_list_controller':'workflow/controllers/creative_list_controller',
      'controllers-actions_controller':'controllers/actions_controller',
      'controllers-optimization_controller':'controllers/optimization_controller',
      'controllers-inventory_controller':'controllers/inventory_controller',
      'controllers-viewability_controller':'controllers/viewability_controller',
      'controllers-cost_controller':'controllers/cost_controller',
      'controllers-performance_controller':'controllers/performance_controller',
      'controllers-platform_controller':'controllers/platform_controller',
      'controllers-custom_report_controller':'controllers/custom_report_controller',

      'controllers-custom_report_upload_controller':'controllers/custom_report_upload_controller',

      'directives-strategycard':'directives/strategycard',
      'directives-tacticcard':'directives/tacticcard',
      'directives-campaigncard':'directives/campaigncard',
      'directives-campaigncostcard':'directives/campaigncostcard',
      'directives-campaignsort':'directives/campaignsort',
      'directives-campaignlistsort':'directives/campaignlistsort',
      'directives-campaigncostsort':'directives/campaigncostsort',
      'directives-campaigndashboard':'directives/campaigndashboard',

      'multiselect':'multiselect',
      'models-domain_reports':'models/domain_reports',
      'models-action_type':'models/action_type',
      'models-activity_list':'models/activity_list',
      'models-action_sub_type':'models/action_sub_type',
      'models-tactic':'models/tactic',
      'models-reports_upload_list':'models/reports_upload_list',
      'services-inventoryservice':'services/inventoryservice',
      'services-viewablityservice':'services/viewablityservice',
      'services-performanceservice':'services/performanceservice',
      'services-platformservice':'services/platformservice',
      'services-costservice':'services/costservice',
      'services-workflowservice':'workflow/services/workflowservice',
      'directives-showerrors':'workflow/directives/showerrors',
      'services-optimizationservice':'services/optimizationservice',
      'services-momentService': 'common/MomentUtils',
      'common-directive-DataNotFound':'common/directives/DataNotFound',
      'angular-locale':'vendor/i18n/angular-locale_en-us',
      'jsRoutes': '/jsroutes'
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
          'angular-resource',
          'angular-route',
          'angular-cookies',
          'angular-cache',
          'ng-infinite-scroll',
           'highcharts',
           'date-picker',
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
           'common-directives-CommonDirectives',
           'common-utils',
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
           'controllers-campaign_create_controller',
           'controllers-campaign_overview_controller',
           'controllers-campaign_adcreate_controller',
           'controllers-creative_controller',
           'controllers-creative_list_controller',
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
           'directives-showerrors',
           'services-optimizationservice',
           'services-momentService',
           'common-directive-DataNotFound',
           'angular-locale',

          'collectiveReport-CollectiveReportModule',
          'collectiveReport-CollectiveReportListingController',
          'collectiveReport-CollectiveReportModel',
          'collectiveReport-CollectiveReportDirective'
           ],

    function ($,jqueryUI,  bootstrap, angular) {
            angular.bootstrap(document, ['app']);
    }
  );
})(requirejs);
