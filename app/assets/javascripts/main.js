// `main.js` is the file that sbt-web will use as an entry point
(function (requirejs) {
  'use strict';

  // -- RequireJS config --
  requirejs.config({
    // Packages = top-level folders; loads a contained file named 'main.js"
    packages: ['brands', 'campaignList', 'common', 'controllers', 'dashboard', 'directives', 'editActions', 'login', 'models', 'services', 'timePeriod','tmp'],
   
    shim: {
      'jsRoutes': {
        deps: [],
        // it's not a RequireJS module, so we have to tell it what var is returned
        exports: 'jsRoutes'
      },
      'jquery': {exports:'jquery'},
      // Hopefully this all will not be necessary but can be fetched from WebJars in the future
      'angular': {
        deps: ['bootstrap'],
        exports: 'angular'
      },
      'jquery-ui': {deps: ['jquery']},
      'bootstrap': {deps: ['jquery-ui']},
      'angular-cache': {deps: ['angular']},
      'angular-cookies': {deps: ['angular-cache']},
      'angular-resource': {deps: ['angular-cookies']},
      'angular-route': {deps: ['angular-resource']},
      'ng-infinite-scroll': {deps: ['angular-route']},
      'highcharts-ng': {deps: ['ng-infinite-scroll']},
      'highcharts': {deps: ['highcharts-ng']},
      'highcharts-more': {deps: ['highcharts']},
      'solid-gauge': {deps: ['highcharts-more']},
      'moment': {deps: ['solid-gauge']},
      'underscore': {deps: ['moment']},
      'angulartics': {deps: ['underscore']},
      'angulartics-ga': {deps: ['angulartics']},
      'd3': {deps: ['angulartics-ga']},
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
      'common-services-datatransferservice':{deps: ['common-services-DataService']},
      'common-services-TransformerService':{deps: ['common-services-datatransferservice']},
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

      'directives-largeListSearch':{deps: ['dashboard-DashboardController']},
      'controllers-directive_controller':{deps: ['directives-largeListSearch']},
      'campaignList-CampaignListModule':{deps: ['controllers-directive_controller']},
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

      'timePeriod-TimePeriodModule':{deps: ['brands-BrandsModel']},
      'timePeriod-TimePeriodModel':{deps: ['timePeriod-TimePeriodModule']},
      'timePeriod-TimePeriodDirective':{deps: ['timePeriod-TimePeriodModel']},
      'timePeriod-TimePeriodController':{deps: ['timePeriod-TimePeriodDirective']},

      'login-LoginModule':{deps: ['timePeriod-TimePeriodController']},
      'login-LoginModel':{deps: ['login-LoginModule']},
      'login-LoginService':{deps: ['login-LoginModel']},
      'login-LoginController':{deps: ['login-LoginService']},

      'controllers-campaign_details_controller':{deps: ['login-LoginController']},
      'controllers-actions_controller':{deps: ['controllers-campaign_details_controller']},
      'controllers-optimization_controller':{deps: ['controllers-actions_controller']},
      'controllers-inventory_controller':{deps: ['controllers-optimization_controller']},
      'controllers-viewability_controller':{deps: ['controllers-inventory_controller']},
      'controllers-cost_controller':{deps: ['controllers-viewability_controller']},
      'controllers-performance_controller':{deps: ['controllers-cost_controller']},
      'directives-strategycard':{deps: ['controllers-performance_controller']},
      'directives-tacticcard':{deps: ['directives-strategycard']},
      'directives-campaigncard':{deps: ['directives-tacticcard']},
      'directives-campaigncostcard':{deps: ['directives-campaigncard']},
      'directives-campaignsort':{deps: ['directives-campaigncostcard']},
      'directives-campaignlistsort':{deps: ['directives-campaignsort']},
      'directives-campaigncostsort':{deps: ['directives-campaignlistsort']},
      'directives-campaigndashboard':{deps: ['directives-campaigncostsort']},
      'directives-reportfilters':{deps: ['directives-campaigndashboard']},
      'directives-strategylist':{deps: ['directives-reportfilters']},
      'multiselect':{deps: ['directives-strategylist']},
      'models-domain_reports':{deps: ['multiselect']},
      'models-action_type':{deps: ['models-domain_reports']},
      'models-activity_list':{deps: ['models-action_type']},
      'models-action_sub_type':{deps: ['models-activity_list']},
      'models-tactic':{deps: ['models-action_sub_type']},
      'services-inventoryservice':{deps: ['models-tactic']},
      'services-viewablityservice':{deps: ['services-inventoryservice']},
      'services-performanceservice':{deps: ['services-viewablityservice']},
      'services-costservice':{deps: ['services-performanceservice']},
      'services-optimizationservice':{deps: ['services-costservice']}
 
    },
    optimize: 'uglify2',
    uglify2: {
    warnings: false,
    /* Mangling defeats Angular injection by function argument names. */
      mangle: false
    },
    paths: {
      'requirejs': 'vendor/require.min',
      'jquery': 'vendor/jquery.min',
      'jquery-ui': 'vendor/jquery-ui.min',
      'angular': 'vendor/angular',
      'angular-resource': 'vendor/angular-resource.min',
      'angular-route': 'vendor/angular-route.min',
      'angular-cookies': 'vendor/angular-cookies',
      'angular-cache': 'vendor/angular-cache-2.3.7',
      'angular-sanitize': 'vendor/angular-sanitize',
      'angulartics': 'vendor/angulartics',
      'angulartics-ga': 'vendor/angulartics-ga',
      'bootstrap': 'vendor/bootstrap.min',
      'highcharts': 'vendor/highcharts',
      'highcharts-ng': 'vendor/highcharts-ng',
      'highcharts-more': 'vendor/highcharts-more',
      'solid-gauge': 'vendor/solid-gauge',
      'moment': 'vendor/moment.min',
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
      'common-services-datatransferservice':'common/services/datatransferservice',
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

      'directives-largeListSearch':'directives/largeListSearch',
      'controllers-directive_controller':'controllers/directive_controller',
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

      'timePeriod-TimePeriodModule':'timePeriod/TimePeriodModule',
      'timePeriod-TimePeriodModel':'timePeriod/TimePeriodModel',
      'timePeriod-TimePeriodDirective':'timePeriod/TimePeriodDirective',
      'timePeriod-TimePeriodController':'timePeriod/TimePeriodController',

      'login-LoginModule':'login/LoginModule',
      'login-LoginModel':'login/LoginModel',
      'login-LoginService':'login/LoginService',
      'login-LoginController':'login/LoginController',

      'controllers-campaign_details_controller':'controllers/campaign_details_controller',
      'controllers-actions_controller':'controllers/actions_controller',
      'controllers-optimization_controller':'controllers/optimization_controller',
      'controllers-inventory_controller':'controllers/inventory_controller',
      'controllers-viewability_controller':'controllers/viewability_controller',
      'controllers-cost_controller':'controllers/cost_controller',
      'controllers-performance_controller':'controllers/performance_controller',
      'directives-strategycard':'directives/strategycard',
      'directives-tacticcard':'directives/tacticcard',
      'directives-campaigncard':'directives/campaigncard',
      'directives-campaigncostcard':'directives/campaigncostcard',
      'directives-campaignsort':'directives/campaignsort',
      'directives-campaignlistsort':'directives/campaignlistsort',
      'directives-campaigncostsort':'directives/campaigncostsort',
      'directives-campaigndashboard':'directives/campaigndashboard',
      'directives-reportfilters':'directives/reportfilters',
      'directives-strategylist':'directives/strategylist',
      'multiselect':'multiselect',
      'models-domain_reports':'models/domain_reports',
      'models-action_type':'models/action_type',
      'models-activity_list':'models/activity_list',
      'models-action_sub_type':'models/action_sub_type',
      'models-tactic':'models/tactic',
      'services-inventoryservice':'services/inventoryservice',
      'services-viewablityservice':'services/viewablityservice',
      'services-performanceservice':'services/performanceservice',
      'services-costservice':'services/costservice',
      'services-optimizationservice':'services/optimizationservice',
 
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
           'angular-resource', 
           'angular-route', 
           'angular-cookies', 
           'angular-cache', 
           'ng-infinite-scroll',
           'highcharts',
           'highcharts-ng',
           'highcharts-more',
           'solid-gauge',
           'moment',
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
           'common-services-datatransferservice',
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

           'directives-largeListSearch',
           'controllers-directive_controller',
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

           'timePeriod-TimePeriodModule',
           'timePeriod-TimePeriodModel',
           'timePeriod-TimePeriodDirective',
           'timePeriod-TimePeriodController',

           'login-LoginModule',
           'login-LoginModel',
           'login-LoginService',
           'login-LoginController',

           'controllers-campaign_details_controller',
           'controllers-actions_controller',
           'controllers-optimization_controller',
           'controllers-inventory_controller',
           'controllers-viewability_controller',
           'controllers-cost_controller',
           'controllers-performance_controller',
           'directives-strategycard',
           'directives-tacticcard',
           'directives-campaigncard',
           'directives-campaigncostcard',
           'directives-campaignsort',
           'directives-campaignlistsort',
           'directives-campaigncostsort',
           'directives-campaigndashboard',
           'directives-reportfilters',
           'directives-strategylist',
           'multiselect',
           'models-domain_reports',
           'models-action_type',
           'models-activity_list',
           'models-action_sub_type',
           'models-tactic',
           'services-inventoryservice',
           'services-viewablityservice',
           'services-performanceservice',
           'services-costservice',
           'services-optimizationservice'
           ],
   
    function (angular) {
      angular.bootstrap(document, ['app']);
    }
  );
})(requirejs);
