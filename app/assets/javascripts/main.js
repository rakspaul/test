// `main.js` is the file that sbt-web will use as an entry point
(function(requirejs) {
    'use strict';
    // -- RequireJS config --
    requirejs.config({
        // Packages = top-level folders; loads a contained file named 'main.js"
        packages: ['brands', 'campaignList', 'campaignSelect', 'strategySelect', 'kpiSelect', 'common', 'controllers',
            'dashboard', 'directives', 'editActions', 'login', 'models', 'services', 'timePeriod', 'tmp'],

        shim: {
            'jsRoutes': {
                deps: [],
                // it's not a RequireJS module, so we have to tell it what var is returned
                exports: 'jsRoutes'
            },
            'jquery': {
                exports: 'jquery'
            },
            'jquery-ui': {
                deps: ['jquery']
            },
            'bootstrap': {
                deps: ['jquery-ui']
            },
            'angular': {
                deps: ['bootstrap'],
                exports: 'angular'
            },
            'angular-cache': {
                deps: ['angular']
            },
            'angular-switch': {
                deps: ['angular']
            },
            'angular-css': {
                deps: ['angular']
            },
            'date-picker': {
                deps: ['jquery', 'bootstrap']
            },
            'bootstrap-toggle': {
                deps: ['jquery', 'bootstrap']
            },
            'angular-cookies': {
                deps: ['angular-cache']
            },
            'angular-resource': {
                deps: ['angular-cookies']
            },
            'angular-route': {
                deps: ['angular-resource']
            },
            'tmhDynamicLocale': {
                deps: ['angular']
            },
            'ng-infinite-scroll': {
                deps: ['angular-route']
            },
            'highcharts-ng': {
                deps: ['ng-infinite-scroll']
            },
            'highcharts': {
                deps: ['highcharts-ng']
            },
            'highcharts-more': {
                deps: ['highcharts']
            },
            'solid-gauge': {
                deps: ['highcharts-more']
            },

            'ng-file-upload-shim': {
                deps: []
            },
            'ng-file-upload': {
                deps: ['angular']
            },

            'underscore': {
                deps: []
            },
            'angulartics': {
                deps: ['angular']
            },
            'angulartics-ga': {
                deps: ['angulartics']
            },
            'd3': {
                deps: ['angulartics-ga']
            },
            'angular-sanitize': {
                deps: ['d3']
            },
            'filesaver': {
                deps: ['angular-sanitize']
            },
            'ui-bootstrap-tpls': {
                deps: ['filesaver']
            },
            'lrInfiniteScroll': {
                deps: ['ui-bootstrap-tpls']
            },
            'jquer_table_sorter_scroller': {
                deps: ['ui-bootstrap-tpls']
            },
            'app': {
                deps: ['lrInfiniteScroll']
            },
            'CommonModule': {
                deps: ['app']
            },
            'common-services-VistoConfigService': {
                deps: ['CommonModule']
            },
            'common-charts-line': {
                deps: ['CommonModule']
            },
            'common-charts-actions': {
                deps: ['common-charts-line']
            },
            'common-charts-columnline': {
                deps: ['common-charts-actions']
            },
            'common-charts-piechart': {
                deps: ['common-charts-columnline']
            },
            'common-charts-solidgauge': {
                deps: ['common-charts-piechart']
            },

            'common-services-DataService': {
                deps: ['common-charts-solidgauge']
            },
            'common-services-TransformerService': {
                deps: ['common-services-DataService']
            },
            'common-services-ConstantsService': {
                deps: ['common-services-TransformerService']
            },

            'common-services-RequestCancelService': {
                deps: ['common-services-ConstantsService']
            },
            'common-services-UrlService': {
                deps: ['common-services-RequestCancelService']
            },
            'reporting-models-CampaignCDBData': {
                deps: ['common-services-UrlService']
            },
            'reporting-models-CampaignCost': {
                deps: ['reporting-models-CampaignCDBData']
            },
            'reporting-models-CampaignModel': {
                deps: ['reporting-models-CampaignCost']
            },
            'common-services-DataStoreModel': {
                deps: ['reporting-models-CampaignModel']
            },
            'common-controllers-header_controller': {
                deps: ['common-services-DataStoreModel']
            },
            'common-controllers-ConfirmationModalController': {
                deps: ['CommonModule']
            },
            'common-directives-CommonDirectives': {
                deps: ['common-controllers-header_controller']
            },
            'common-utils': {
                deps: ['common-directives-CommonDirectives']
            },
            'common-pop_up_msg': {
                deps: ['CommonModule']
            },
            'common-services-AnalyticsService': {
                deps: ['common-utils']
            },
            'common-d3-gauge': {
                deps: ['common-services-AnalyticsService']
            },
            'common-d3-quartilesGraph': {
                deps: ['common-services-AnalyticsService']
            },
            'common-d3-campaignChart': {
                deps: ['common-services-AnalyticsService']
            },
            'common-d3-barChart': {
                deps: ['common-services-AnalyticsService']
            },
            'common-d3-pieChart': {
                deps: ['common-services-AnalyticsService']
            },
            'reporting-controllers-GaugeController': {
                deps: ['common-d3-gauge']
            },
            'reporting-models-GaugeModel': {
                deps: ['reporting-controllers-GaugeController']
            },
            'common-d3-bubbleChart': {
                deps: ['reporting-models-GaugeModel']
            },
            'reporting-controllers-BubbleChartController': {
                deps: ['common-d3-bubbleChart']
            },
            'reporting-models-BubbleChartModel': {
                deps: ['reporting-controllers-BubbleChartController']
            },
            'common-d3-screenChart': {
                deps: ['reporting-models-BubbleChartModel']
            },
            'reporting-controllers-ScreenChartController': {
                deps: ['common-d3-screenChart']
            },
            'reporting-models-ScreenChartModel': {
                deps: ['reporting-controllers-ScreenChartController']
            },
            'common-d3-ganttChart': {
                deps: ['reporting-models-ScreenChartModel']
            },
            'reporting-controllers-GanttChartController': {
                deps: ['common-d3-ganttChart']
            },
            'reporting-models-GanttChartModel': {
                deps: ['reporting-controllers-GanttChartController']
            },

            'dashboard-DashboardModule': {
                deps: ['reporting-models-GanttChartModel']
            },
            'dashboard-DashboardModel': {
                deps: ['dashboard-DashboardModule']
            },
            'dashboard-DashboardController': {
                deps: ['dashboard-DashboardModel']
            },
            'dashboard-DashboardController_2': {
                deps: ['dashboard-DashboardController']
            },

            'campaignList-CampaignListModule': {
                deps: ['dashboard-DashboardController_2']
            },
            'campaignList-CampaignListModel': {
                deps: ['campaignList-CampaignListModule']
            },
            'campaignList-CampaignListService': {
                deps: ['campaignList-CampaignListModel']
            },
            'campaignList-CampaignListController': {
                deps: ['campaignList-CampaignListService']
            },
            'campaignList-CampaignListFilterDirective': {
                deps: ['campaignList-CampaignListModule']
            },
            'workflow-controllers-CampaignListController': {
                deps: ['campaignList-CampaignListService']
            },

            'editActions-EditActionsModule': {
                deps: ['campaignList-CampaignListController']
            },
            'editActions-EditActionsModel': {
                deps: ['editActions-EditActionsModule']
            },
            'editActions-EditActionsService': {
                deps: ['editActions-EditActionsModel']
            },
            'editActions-EditActionsController': {
                deps: ['editActions-EditActionsService']
            },

            'brands-BrandsModule': {
                deps: ['editActions-EditActionsController']
            },
            'brands-BrandsController': {
                deps: ['brands-BrandsModule']
            },
            'brands-BrandsListController': {
                deps: ['brands-BrandsController']
            },
            'brands-BrandsDirective': {
                deps: ['brands-BrandsListController']
            },
            'brands-BrandsService': {
                deps: ['brands-BrandsDirective']
            },
            'brands-BrandsModel': {
                deps: ['brands-BrandsService']
            },

            'advertiser-AdvertiserModule': {
                deps: ['editActions-EditActionsController']
            },
            'advertiser-AdvertiserController': {
                deps: ['brands-BrandsModule']
            },
            'advertiser-AdvertiserListController': {
                deps: ['advertiser-AdvertiserController']
            },
            'advertiser-AdvertiserDirective': {
                deps: ['editActions-EditActionsController']
            },
            'advertiser-AdvertiserService': {
                deps: ['advertiser-AdvertiserDirective']
            },
            'advertiser-AdvertiserModel': {
                deps: ['advertiser-AdvertiserService']
            },

            'campaignSelect-CampaignSelectModule': {
                deps: ['brands-BrandsModel']
            },
            'campaignSelect-CampaignSelectDirective': {
                deps: ['campaignSelect-CampaignSelectModule']
            },
            'campaignSelect-CampaignSelectModel': {
                deps: ['campaignSelect-CampaignSelectDirective']
            },
            'campaignSelect-CampaignSelectController': {
                deps: ['campaignSelect-CampaignSelectModel']
            },

            'strategySelect-StrategySelectModule': {
                deps: ['campaignSelect-CampaignSelectController']
            },
            'strategySelect-StrategySelectDirective': {
                deps: ['strategySelect-StrategySelectModule']
            },
            'strategySelect-StrategySelectModel': {
                deps: ['strategySelect-StrategySelectDirective']
            },
            'strategySelect-StrategySelectController': {
                deps: ['strategySelect-StrategySelectModel']
            },

            'kpiSelect-KpiSelectModule': {
                deps: ['campaignSelect-CampaignSelectController']
            },
            'kpiSelect-KpiSelectDirective': {
                deps: ['kpiSelect-KpiSelectModule']
            },
            'kpiSelect-KpiSelectModel': {
                deps: ['kpiSelect-KpiSelectDirective']
            },
            'kpiSelect-KpiSelectController': {
                deps: ['kpiSelect-KpiSelectModel']
            },

            'timePeriod-TimePeriodModule': {
                deps: ['brands-BrandsModel']
            },
            'timePeriod-TimePeriodModel': {
                deps: ['timePeriod-TimePeriodModule']
            },
            'timePeriod-TimePeriodDirective': {
                deps: ['timePeriod-TimePeriodModel']
            },
            'timePeriod-TimePeriodPickDirective': {
                deps: ['timePeriod-TimePeriodModel']
            },
            'timePeriod-TimePeriodController': {
                deps: ['timePeriod-TimePeriodDirective']
            },
            'timePeriod-TimePeriodPickController': {
                deps: ['timePeriod-TimePeriodDirective']
            },

            'login-LoginModule': {
                deps: ['timePeriod-TimePeriodController']
            },
            'login-LoginModel': {
                deps: ['login-LoginModule']
            },
            'login-LoginService': {
                deps: ['login-LoginModel']
            },
            'login-LoginController': {
                deps: ['login-LoginService']
            },
            'common-services-RoleBasedService': {
                deps: ['login-LoginService']
            }, //roleBased
            'common-AccountChangeController': {
                deps: ['login-LoginService']
            },
            'controllers-campaign_details_controller': {
                deps: ['login-LoginController']
            },
            'controllers-campaign_create_controller': {
                deps: ['controllers-campaign_details_controller']
            },
            'controllers-help_controller': {
                deps: ['controllers-campaign_details_controller']
            },
            'controllers-campaign_overview_controller': {
                deps: ['controllers-campaign_create_controller']
            },
            'controllers-create_adgroups_controller': {
                deps: ['controllers-campaign_overview_controller']
            },
            'controllers-get_adgroups_controller': {
                deps: ['controllers-campaign_overview_controller']
            },
            'controllers-campaign_adcreate_controller': {
                deps: ['controllers-campaign_overview_controller']
            },
            'controllers-targetting_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-geo_targetting_controller': {
                deps: ['controllers-targetting_controller']
            },
            'controllers-audience_targetting_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-daypart_create_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-creative_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-buying_platform_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-budget_delivery_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-creative_tag_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-inventory_filters_controller': {
                deps: ['controllers-campaign_adcreate_controller']
            },
            'controllers-creative_list_controller': {
                deps: ['controllers-creative_controller']
            },
            'controllers-accounts_controller': {
                deps: ['controllers-campaign_details_controller']
            },
            'controllers-users_controller': {
                deps: ['controllers-campaign_details_controller']
            },
            'controllers-actions_controller': {
                deps: ['controllers-creative_list_controller']
            },
            'controllers-optimization_controller': {
                deps: ['controllers-actions_controller']
            },
            'controllers-inventory_controller': {
                deps: ['controllers-optimization_controller']
            },
            'controllers-viewability_controller': {
                deps: ['controllers-inventory_controller']
            },
            'controllers-cost_controller': {
                deps: ['controllers-viewability_controller']
            },
            'controllers-performance_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-platform_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-custom_report_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-accounts_add_or_edit_advertiser_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-accounts_add_or_edit_brand_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-accounts_add_or_edit_controller': {
                deps: ['controllers-cost_controller']
            },
            'controllers-users_add_or_edit_controller': {
                deps: ['controllers-cost_controller']
            },

            'controllers-custom_report_upload_controller': {
                deps: ['controllers-custom_report_controller']
            },

            'directives-strategycard': {
                deps: ['controllers-performance_controller']
            },
            'directives-tacticcard': {
                deps: ['directives-strategycard']
            },
            'directives-campaigncard': {
                deps: ['directives-tacticcard']
            },
            'directives-campaigncostcard': {
                deps: ['directives-campaigncard']
            },
            'directives-campaignsort': {
                deps: ['directives-campaigncostcard']
            },
            'directives-campaignlistsort': {
                deps: ['directives-campaignsort']
            },
            'directives-campaigncostsort': {
                deps: ['directives-campaignlistsort']
            },
            'directives-campaigndashboard': {
                deps: ['directives-campaigncostsort']
            },
            'multiselect': {
                deps: ['directives-campaigndashboard']
            },
            'models-domain_reports': {
                deps: ['multiselect']
            },
            'models-action_type': {
                deps: ['models-domain_reports']
            },
            'models-activity_list': {
                deps: ['models-action_type']
            },
            'models-action_sub_type': {
                deps: ['models-activity_list']
            },
            'models-tactic': {
                deps: ['models-action_sub_type']
            },
            'models-reports_upload_list': {
                deps: ['models-action_sub_type']
            },
            'services-workflowservice': {
                deps: ['models-reports_upload_list']
            },
            'services-accountservice': {
                deps: ['services-workflowservice']
            },
            'services-audienceservice': {
                deps: ['services-workflowservice']
            },
            'services-platform_custome_module': {
                deps: ['services-workflowservice']
            },
            'directives-showerrors': {
                deps: ['services-workflowservice']
            },
            'directives-creativedropdown': {
                deps: ['services-workflowservice']
            },
            'directives-customdatepicker': {
                deps: ['services-workflowservice']
            },
            'directives-clearrow': {
                deps: ['services-workflowservice']
            },
            'directives-ngupdatehiddendropdown': {
                deps: ['services-workflowservice']
            },
            'directives-nguploadhidden': {
                deps: ['services-workflowservice']
            },
            'services-momentService': {
                deps: ['login-LoginModel']
            },
            'common-directive-DataNotFound': {
                deps: ['CommonModule']
            },
            'common-services-zipCode': {
                deps: ['CommonModule']
            },
            'common-services-fileReader': {
                deps: ['CommonModule']
            },
            'collectiveReport-CollectiveReportModule': {
                deps: ['angular']
            },
            'collectiveReport-collective_report_listing_controller': {
                deps: ['collectiveReport-CollectiveReportModule']
            },
            'collectiveReport-reports_schedule_list_controller': {
                deps: ['collectiveReport-CollectiveReportModule']
            },
            'collectiveReport-ReportScheduleDeleteController': {
                deps: ['collectiveReport-CollectiveReportModule']
            },
            'collectiveReport-CollectiveReportModel': {
                deps: ['collectiveReport-CollectiveReportModule']
            },
            //'collectiveReport-CollectiveReportDirective':{deps: ['collectiveReport-CollectiveReportModule']},
            'collectiveReport-collective_edit_report_controller': {
                deps: ['collectiveReport-CollectiveReportModule']
            },
            'collectiveReport-CollectiveDeleteReportController': {
                deps: ['collectiveReport-CollectiveReportModule']
            }

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
            'angular-switch': 'vendor/angular-ui-switch.min',
            'angular-css': 'vendor/angular-css.min',
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
            'jquer_table_sorter_scroller': 'vendor/jquer_table_sorter_scroller',
            'ui-bootstrap-tpls': 'vendor/ui-bootstrap-tpls-0.12.1.min',
            'd3': 'vendor/d3',
            'filesaver': 'vendor/filesaver',
            'app': 'app',
            'CommonModule': 'common/common_module',
            'common-charts-line': 'reporting/common/charts/line',
            'common-charts-actions': 'reporting/common/charts/actions',
            'common-charts-columnline': 'reporting/common/charts/column_line',
            'common-charts-piechart': 'reporting/common/charts/pie_chart',
            'common-charts-solidgauge': 'reporting/common/charts/solid_gauge',
            'common-services-DataService': 'common/services/data_service',
            'common-services-TransformerService': 'common/services/transformer_service',
            'common-services-ConstantsService': 'common/services/constants_service',
            'common-services-VistoConfigService': 'common/services/vistoconfig_service',
            'common-services-RequestCancelService': 'common/services/request_cancel_service',
            'common-services-UrlService': 'common/services/url_service',
            'reporting-models-CampaignCDBData': 'reporting/models/campaign_cdb_data',
            'reporting-models-CampaignCost': 'reporting/models/campaign_cost',
            'reporting-models-CampaignModel': 'reporting/models/campaign_model',
            'common-services-DataStoreModel': 'common/services/data_store_model',
            'common-controllers-header_controller': 'common/controllers/header_controller',
            'common-controllers-ConfirmationModalController': 'common/controllers/confirmation_modal_controller',
            'common-directives-CommonDirectives': 'common/directives/common_directives',
            'common-utils': 'common/utils',
            'common-pop_up_msg': 'common/popup_msg',
            'common-services-AnalyticsService': 'common/services/analytics_service',
            'common-d3-gauge': 'reporting/common/d3/gauge',
            'common-d3-quartilesGraph': 'reporting/common/d3/quartiles_graph',
            'common-d3-campaignChart': 'reporting/common/d3/campaign_chart',
            'common-d3-barChart': 'reporting/common/d3/bar_chart',
            'common-d3-pieChart': 'reporting/common/d3/pie_chart',
            'reporting-controllers-GaugeController': 'reporting/controllers/gauge_controller',
            'reporting-models-GaugeModel': 'reporting/models/gauge_model',
            'common-d3-bubbleChart': 'reporting/common/d3/bubble_chart',
            'reporting-controllers-BubbleChartController': 'reporting/controllers/bubble_chart_controller',
            'reporting-models-BubbleChartModel': 'reporting/models/bubble_chart_model',
            'common-d3-screenChart': 'reporting/common/d3/screen_chart',
            'reporting-controllers-ScreenChartController': 'reporting/controllers/screen_chart_controller',
            'reporting-models-ScreenChartModel': 'reporting/models/screen_chart_model',

            'common-d3-ganttChart': 'reporting/common/d3/gantt_chart',
            'reporting-controllers-GanttChartController': 'reporting/controllers/gantt_chart_controller',
            'reporting-models-GanttChartModel': 'reporting/models/gantt_chart_model',

            'dashboard-DashboardModule': 'reporting/dashboard/dashboard_module',
            'dashboard-DashboardModel': 'reporting/dashboard/dashboard_model',
            'dashboard-DashboardController': 'reporting/dashboard/dashboard_controller',

            'campaignList-CampaignListModule': 'reporting/campaignList/campaign_list_module',
            'campaignList-CampaignListModel': 'reporting/campaignList/campaign_list_model',
            'campaignList-CampaignListService': 'reporting/campaignList/campaign_list_service',
            'campaignList-CampaignListController': 'reporting/campaignList/campaign_list_controller',
            'campaignList-CampaignListFilterDirective': 'reporting/campaignList/campaign_list_filter_directive',

            'editActions-EditActionsModule': 'reporting/editActions/edit_actions_module',
            'editActions-EditActionsModel': 'reporting/editActions/edit_actions_model',
            'editActions-EditActionsService': 'reporting/editActions/edit_actions_service',
            'editActions-EditActionsController': 'reporting/editActions/edit_actions_controller',

            'brands-BrandsModule': 'reporting/brands/brands_module',
            'brands-BrandsController': 'reporting/brands/brands_controller',
            'brands-BrandsListController': 'reporting/brands/brands_list_controller',
            'brands-BrandsDirective': 'reporting/brands/brands_directive',
            'brands-BrandsService': 'reporting/brands/brands_service',
            'brands-BrandsModel': 'reporting/brands/brands_model',

            'advertiser-AdvertiserDirective': 'reporting/advertiser/advertiser_directive',
            'advertiser-AdvertiserModule': 'reporting/advertiser/advertiser_module',
            'advertiser-AdvertiserController': 'reporting/advertiser/advertiser_controller',
            'advertiser-AdvertiserListController': 'reporting/advertiser/advertiser_list_controller',

            'advertiser-AdvertiserService': 'reporting/advertiser/advertiser_service',
            'advertiser-AdvertiserModel': 'reporting/advertiser/advertiser_model',

            'campaignSelect-CampaignSelectModule': 'reporting/campaignSelect/campaign_select_module',
            'campaignSelect-CampaignSelectController': 'reporting/campaignSelect/campaign_select_controller',
            'campaignSelect-CampaignSelectDirective': 'reporting/campaignSelect/campaign_select_directive',
            'campaignSelect-CampaignSelectModel': 'reporting/campaignSelect/campaign_select_model',

            'strategySelect-StrategySelectModule': 'reporting/strategySelect/strategy_select_module',
            'strategySelect-StrategySelectController': 'reporting/strategySelect/strategy_select_controller',
            'strategySelect-StrategySelectDirective': 'reporting/strategySelect/strategy_select_directive',
            'strategySelect-StrategySelectModel': 'reporting/strategySelect/strategy_select_model',

            'kpiSelect-KpiSelectModule': 'reporting/kpiSelect/kpi_select_module',
            'kpiSelect-KpiSelectController': 'reporting/kpiSelect/kpi_select_controller',
            'kpiSelect-KpiSelectDirective': 'reporting/kpiSelect/kpi_select_directive',
            'kpiSelect-KpiSelectModel': 'reporting/kpiSelect/kpi_select_model',

            'timePeriod-TimePeriodModule': 'reporting/timePeriod/time_period_module',
            'timePeriod-TimePeriodModel': 'reporting/timePeriod/time_period_model',
            'timePeriod-TimePeriodDirective': 'reporting/timePeriod/time_period_directive',
            'timePeriod-TimePeriodPickDirective': 'reporting/timePeriod/time_period_pick_directive',
            'timePeriod-TimePeriodController': 'reporting/timePeriod/time_period_controller',
            'timePeriod-TimePeriodPickController': 'reporting/timePeriod/time_period_pick_controller',

            'login-LoginModule': 'login/login_module',
            'login-LoginModel': 'login/login_model',
            'login-LoginService': 'login/login_service',
            'login-LoginController': 'login/login_controller',

            'collectiveReport-CollectiveReportModule': 'reporting/collectiveReport/collective_report_module',
            'collectiveReport-collective_report_listing_controller':
                'reporting/collectiveReport/collective_report_listing_controller',
            'collectiveReport-reports_schedule_list_controller':
                'reporting/collectiveReport/reports_schedule_list_controller',
            'collectiveReport-ReportScheduleDeleteController':
                'reporting/collectiveReport/report_schedule_delete_controller',
            'collectiveReport-CollectiveReportModel': 'reporting/collectiveReport/collective_report_model',
            'collectiveReport-collective_edit_report_controller':
                'reporting/collectiveReport/collective_edit_report_controller',
            'collectiveReport-CollectiveDeleteReportController':
                'reporting/collectiveReport/collective_delete_report_controller',


            'controllers-campaign_details_controller': 'reporting/controllers/campaign_details_controller',
            'controllers-help_controller': 'reporting/controllers/help_controller',
            'controllers-campaign_create_controller': 'workflow/controllers/campaign_create_controller',
            'controllers-campaign_overview_controller': 'workflow/controllers/campaign_overview_controller',
            'controllers-create_adgroups_controller': 'workflow/controllers/create_adgroups_controller',
            'controllers-get_adgroups_controller': 'workflow/controllers/get_adgroups_controller',

            'controllers-campaign_adcreate_controller': 'workflow/controllers/campaign_adcreate_controller',
            'controllers-buying_platform_controller': 'workflow/controllers/buying_platform_controller',
            'controllers-budget_delivery_controller': 'workflow/controllers/budget_delivery_controller',
            'controllers-creative_tag_controller': 'workflow/controllers/creative_tag_controller',
            'controllers-inventory_filters_controller': 'workflow/controllers/inventory_filters_controller',
            'controllers-targetting_controller': 'workflow/controllers/targetting_controller',
            'controllers-geo_targetting_controller': 'workflow/controllers/geo_targetting_controller',
            'controllers-audience_targetting_controller': 'workflow/controllers/audience_targetting_controller',
            'controllers-daypart_create_controller': 'workflow/controllers/daypart_create_controller',

            'controllers-creative_controller': 'workflow/controllers/creative_controller',
            'controllers-creative_list_controller': 'workflow/controllers/creative_list_controller',
            'controllers-accounts_add_or_edit_advertiser_controller':
                'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
            'controllers-accounts_add_or_edit_brand_controller':
                'common/controllers/accounts/accounts_add_or_edit_brand_controller',
            'controllers-accounts_add_or_edit_controller':
                'common/controllers/accounts/accounts_add_or_edit_controller',
            'controllers-users_add_or_edit_controller': 'common/controllers/users/users_add_or_edit_controller',
            'controllers-accounts_controller': 'common/controllers/accounts/accounts_controller',
            'controllers-users_controller': 'common/controllers/users/users_controller',
            'controllers-actions_controller': 'reporting/controllers/actions_controller',
            'controllers-optimization_controller': 'reporting/controllers/optimization_controller',
            'controllers-inventory_controller': 'reporting/controllers/inventory_controller',
            'controllers-viewability_controller': 'reporting/controllers/viewability_controller',
            'controllers-cost_controller': 'reporting/controllers/cost_controller',
            'controllers-performance_controller': 'reporting/controllers/performance_controller',
            'controllers-platform_controller': 'reporting/controllers/platform_controller',
            'controllers-custom_report_controller': 'reporting/controllers/custom_report_controller',

            'controllers-custom_report_upload_controller': 'reporting/controllers/custom_report_upload_controller',

            'directives-strategycard': 'reporting/directives/strategy_card',
            'directives-tacticcard': 'reporting/directives/tactic_card',
            'directives-campaigncard': 'reporting/directives/campaign_card',
            'directives-campaigncostcard': 'reporting/directives/campaign_cost_card',
            'directives-campaignsort': 'reporting/directives/campaign_sort',
            'directives-campaignlistsort': 'reporting/directives/campaign_list_sort',
            'directives-campaigncostsort': 'reporting/directives/campaign_cost_sort',
            'directives-campaigndashboard': 'reporting/directives/campaign_dashboard',

            'multiselect': 'multi_select',
            'models-domain_reports': 'reporting/models/domain_reports',
            'models-action_type': 'reporting/models/action_type',
            'models-activity_list': 'reporting/models/activity_list',
            'models-action_sub_type': 'reporting/models/action_sub_type',
            'models-tactic': 'reporting/models/tactic',
            'models-reports_upload_list': 'reporting/models/reports_upload_list',
            'services-workflowservice': 'workflow/services/workflow_service',
            'services-accountservice': 'workflow/services/account_service',
            'services-audienceservice': 'workflow/services/audience_service',
            'services-platform_custome_module': 'workflow/services/platform_custome_module',
            'directives-showerrors': 'workflow/directives/show_errors',
            'directives-creativedropdown': 'workflow/directives/creative_drop_down',
            'directives-customdatepicker': 'workflow/directives/custom_date_picker',
            'directives-clearrow': 'workflow/directives/clear_row',
            'directives-ngupdatehiddendropdown': 'workflow/directives/ng_update_hidden_dropdown',
            'directives-nguploadhidden': 'workflow/directives/ng_upload_hidden',
            'services-optimizationservice': 'reporting/services/optimization_service',
            'services-momentService': 'common/moment_utils',
            'common-directive-DataNotFound': 'common/directives/data_not_found',
            'common-services-zipCode': 'common/services/zip_code',
            'common-services-fileReader': 'workflow/services/file_reader',
            'jsRoutes': '/jsroutes',
            'common-services-RoleBasedService': 'common/services/role_based_service',
            'common-AccountChangeController': 'common/account_change_controller',

            //Visto 2.0
            'dashboard-DashboardController_2': 'visto2.0/dashboard_controller'
        }

    });

    requirejs.onError = function(err) {
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
            'common-services-VistoConfigService',
            'common-services-RequestCancelService',
            'common-services-UrlService',
            'reporting-models-CampaignCDBData',
            'reporting-models-CampaignCost',
            'reporting-models-CampaignModel',
            'common-services-DataStoreModel',
            'common-controllers-header_controller',
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
            'reporting-controllers-GaugeController',
            'reporting-models-GaugeModel',
            'common-d3-bubbleChart',
            'reporting-controllers-BubbleChartController',
            'reporting-models-BubbleChartModel',
            'common-d3-screenChart',
            'reporting-controllers-ScreenChartController',
            'reporting-models-ScreenChartModel',

            'common-d3-ganttChart',
            'reporting-controllers-GanttChartController',
            'reporting-models-GanttChartModel',

            'dashboard-DashboardModule',
            'dashboard-DashboardModel',
            'dashboard-DashboardController',
            'dashboard-DashboardController_2',

            'campaignList-CampaignListModule',
            'campaignList-CampaignListModel',
            'campaignList-CampaignListService',
            'campaignList-CampaignListController',
            'campaignList-CampaignListFilterDirective',

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
            'timePeriod-TimePeriodPickDirective',
            'timePeriod-TimePeriodController',
            'timePeriod-TimePeriodPickController',

            'login-LoginModule',
            'login-LoginModel',
            'login-LoginService',
            'login-LoginController',

            'controllers-campaign_details_controller',
            'controllers-help_controller',

            'controllers-campaign_create_controller',
            'controllers-campaign_overview_controller',
            'controllers-create_adgroups_controller',
            'controllers-get_adgroups_controller',

            'controllers-campaign_adcreate_controller',
            'controllers-buying_platform_controller',
            'controllers-budget_delivery_controller',
            'controllers-creative_tag_controller',
            'controllers-inventory_filters_controller',

            'controllers-targetting_controller',
            'controllers-geo_targetting_controller',
            'controllers-audience_targetting_controller',
            'controllers-daypart_create_controller',

            'controllers-creative_controller',
            'controllers-creative_list_controller',
            'controllers-accounts_add_or_edit_advertiser_controller',
            'controllers-accounts_add_or_edit_brand_controller',
            'controllers-accounts_add_or_edit_controller',
            'controllers-users_add_or_edit_controller',
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
            'common-services-fileReader',
            'common-services-RoleBasedService',
            'common-AccountChangeController'
        ],

        function($, jqueryUI, bootstrap, angular) {
            angular.bootstrap(document, ['app']);
        }
    );
})(requirejs);