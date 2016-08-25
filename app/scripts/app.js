define(['common'], function (angularAMD) {
    'use strict';

    angular
        .module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
        .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 'ngFileUpload', function () {}])
        .directive('carousel', [function () {
            return {};
        }]);

    var app = angular.module('vistoApp', ['ngRoute', 'ngCookies', 'tmh.dynamicLocale', 'ui.bootstrap', 'uiSwitch', 'door3.css', 'ngFileUpload',
        'ngSanitize', 'ui.multiselect', 'highcharts-ng', 'ui.bootstrap.showErrors', 'ngTagsInput']);

    app
        .config(function ($routeProvider, $httpProvider) {
            $routeProvider.caseInsensitiveMatch = true;

            $routeProvider
                .when('/', angularAMD.route({
                    title: 'Bootstrapping the Visto',
                    templateUrl: 'home.html',
                    controller: function ($cookieStore, $location, RoleBasedService, dataService, accountService) {
                        var preferredClientId;

                        console.log('Home page controller is initialized');
                        if ($cookieStore.get('cdesk_session')) {
                            preferredClientId = RoleBasedService.getUserData().preferred_client;
                            console.log('preferredClientId', preferredClientId);
                            dataService.updateRequestHeader();

                            accountService
                                .fetchAccountList()
                                .then(function () {
                                    var account,
                                        url;

                                    if (preferredClientId) {
                                        account = _.find(accountService.getAccounts(), function (client) {
                                            return client.id === preferredClientId;
                                        });

                                        if(!account) {
                                            account = accountService.getAccounts()[0];
                                        }
                                    } else {
                                        account = accountService.getAccounts()[0];
                                    }

                                    if (account.isLeafNode) {
                                        url = '/a/' + account.id + '/dashboard';
                                    } else {
                                        url = '/a/' + account.id + '/sa/' + account.id + '/dashboard';
                                    }

                                    $location.url(url);
                                });
                        }
                    },

                    showHeader: true
                }))

                .when('/login', angularAMD.route({
                    templateUrl: assets.html_reports_login,
                    title: 'Login',
                    controller: 'loginController',
                    showHeader: false,
                    controllerUrl: 'login/login_controller'
                }))

                .when('/a/:accountId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    // TODO: Move resolve header callback to routeResolvers service
                    resolve: {
                        header: function (routeResolversParams, routeResolvers, $timeout) {
                            var deferrer = routeResolversParams.$q.defer(),
                                params = routeResolversParams.$route.current.params;

                            routeResolvers
                                .dashboardHeaderResolver(routeResolversParams)
                                .then(function () {
                                    routeResolversParams
                                        .advertiserModel
                                        .fetchAdvertiserList(params.accountId)
                                        .then(function () {
                                            if (routeResolversParams.advertiserModel.allowedAdvertiser(params.advertiserId)) {
                                                routeResolversParams
                                                    .brandsModel
                                                    .fetchBrandList(params.accountId, params.advertiserId)
                                                    .then(function () {
                                                        if (routeResolversParams.brandsModel.allowedBrand(params.brandId)) {
                                                            deferrer.resolve();

                                                            $timeout(function () {
                                                                // hack -> wait till the dashboard (with header) page loads
                                                                params.advertiserId && routeResolvers.fetchCurrentAdvertiser(routeResolversParams);

                                                                params.advertiserId && params.brandId &&
                                                                routeResolvers.fetchCurrentBrand(routeResolversParams);
                                                            }, 1000);
                                                        } else {
                                                            deferrer.reject('brand not allowed');
                                                            console.log('brand not allowed');
                                                            routeResolversParams.$location.url('/tmp');
                                                        }
                                                    });
                                            } else {
                                                deferrer.reject('advertiser not allowed');
                                                console.log('advertiser not allowed');
                                                routeResolversParams.$location.url('/tmp');
                                            }
                                        });
                                });

                            return deferrer.promise;
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    // TODO: Move resolve header callback to routeResolvers service
                    resolve: {
                        header: function (routeResolversParams, routeResolvers, $timeout) {
                            var deferrer = routeResolversParams.$q.defer(),
                                params = routeResolversParams.$route.current.params;

                            routeResolvers
                                .dashboardHeaderResolver2(routeResolversParams)
                                .then(function () {
                                    routeResolversParams
                                        .advertiserModel
                                        .fetchAdvertiserList(params.subAccountId)
                                        .then(function () {
                                            if (routeResolversParams.advertiserModel.allowedAdvertiser(params.advertiserId)) {
                                                routeResolversParams
                                                    .brandsModel
                                                    .fetchBrandList(params.subAccountId, params.advertiserId)
                                                    .then(function () {
                                                        if (routeResolversParams.brandsModel.allowedBrand(params.brandId)) {
                                                            deferrer.resolve();

                                                            $timeout(function () { // jshint:ignore
                                                                // hack -> wait till the dashboard (with header) page loads
                                                                params.advertiserId && routeResolvers.fetchCurrentAdvertiser(routeResolversParams);
                                                                params.advertiserId && params.brandId && routeResolvers.fetchCurrentBrand(routeResolversParams);
                                                            }, 1000);
                                                        } else {
                                                            deferrer.reject('brand not allowed');
                                                            console.log('brand not allowed');
                                                            routeResolversParams.$location.url('/tmp');
                                                        }
                                                    });
                                            } else {
                                                deferrer.reject('advertiser not allowed');
                                                console.log('advertiser not allowed');
                                                routeResolversParams.$location.url('/tmp');
                                            }
                                        });
                                });

                            return deferrer.promise;
                        }
                    }
                }))

                .when('/a/:accountId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            console.log('Reports overview..........');
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))


                .when('/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/reports/schedules', angularAMD.route({
                    templateUrl: assets.html_reports_schedule_list,
                    title: 'Scheduled Reports',
                    controller: 'ReportsScheduleListController',
                    controllerUrl: 'reporting/collectiveReport/reports_schedule_list_controller',
                    showHeader: true,
                    css: assets.css_reports_schedule_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.scheduleReportListCreateResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/customreport', angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'reporting/controllers/custom_report_controller',
                    showHeader: true,
                    bodyclass: 'custom_report_page',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.scheduleReportListCreateResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/customreport/edit/:reportId', angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'reporting/controllers/custom_report_controller',
                    showHeader: true,
                    bodyclass: 'custom_report_page',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams,routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams,routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/v1sto/invoices', angularAMD.route({
                    templateUrl: assets.html_reports_invoice_list,
                    title: 'Invoices Reports',
                    controller: 'ReportsInvoiceListController',
                    controllerUrl: 'reporting/collectiveReport/reports_invoice_list_controller',
                    showHeader: true,
                    css: assets.css_reports_invoice_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            console.log('v1sto/invoices route!');
                            return routeResolvers.invoiceHeader(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/v1sto/invoices/:invoiceId', angularAMD.route({
                    templateUrl: assets.html_reports_invoice,
                    title: 'Media Plan - Overview',
                    controller: 'reportsInvoiceController',
                    controllerUrl: 'reporting/collectiveReport/reports_invoice_controller',
                    showHeader: true,
                    css: assets.css_reports_invoice_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.invoiceHeader(routeResolversParams);
                        }
                    }
                }))

                .when('/vendor/create', angularAMD.route({
                    templateUrl: assets.html_vendor_create,
                    title: 'Create - Vendor',
                    controller: 'CreateVendorController',
                    controllerUrl: '/workflow/vendors/vendor_create_controller',
                    showHeader: true
                }))

                .when('/vendors/list', angularAMD.route({
                    templateUrl: assets.html_vendors_list,
                    title: 'Vendors - List',
                    controller: 'VendorsListController',
                    controllerUrl: 'workflow/vendors/vendors_list_controller',
                    showHeader: true,
                    css: assets.css_table_list
                }))

                .when('/a/:accountId/admin/accounts', angularAMD.route({
                    templateUrl: assets.html_accounts,
                    title: 'Accounts',
                    controller: 'AccountsController',
                    controllerUrl: 'common/controllers/accounts/accounts_controller',
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/admin/users', angularAMD.route({
                    templateUrl: assets.html_users,
                    title: 'Users',
                    controller: 'UsersController',
                    controllerUrl: 'common/controllers/users/users_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/admin/brands', angularAMD.route({
                    templateUrl: assets.html_brands,
                    title: 'AdminBrands',
                    controller: 'AdminAdvertisersController',
                    controllerUrl: 'common/controllers/accounts/admin_brands_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/admin/advertisers', angularAMD.route({
                    templateUrl: assets.html_advertisers,
                    title: 'AdminAdvertisers',
                    controller: 'AdminUsersController',
                    controllerUrl: 'common/controllers/accounts/admin_advertisers_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/mediaplan/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'workflow/campaign/campaign_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'create');
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplan/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'workflow/campaign/campaign_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams,routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'create');
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplan/:campaignId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Edit - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'workflow/campaign/campaign_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams,routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'edit');
                        }
                    }
                }))

                .when('/a/:accountId/mediaplan/:campaignId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Edit - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'workflow/campaign/campaign_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'edit');
                        }
                    }
                }))

                .when('/a/:accountId/mediaplan/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_create_ad,
                    title: 'Media Plan - Overview',
                    controller: 'CampaignOverViewController',
                    controllerUrl: 'workflow/overview/campaign_overview_controller',
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanOverviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/mediaplan/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_create_ad,
                    title: 'Media Plan - Overview',
                    controller: 'CampaignOverViewController',
                    controllerUrl: 'workflow/overview/campaign_overview_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanOverviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            // TODO: Check out this method's implementation
                            return routeResolvers.adsResolver(routeResolversParams, 'create');
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adsResolver(routeResolversParams, 'create');
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adsResolver(routeResolversParams, 'edit');
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adsResolver(routeResolversParams, 'edit');
                        }
                    }
                }))

                .when('/a/:accountId/creative/add', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Add Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/creative/add', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Add Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }

                }))

                .when('/a/:accountId/creative/:creativeId/edit', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Edit Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/creative/:creativeId/edit', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Edit Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/creative/list', angularAMD.route({
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    controllerUrl: 'workflow/creative/creative_list_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeListResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/creative/list', angularAMD.route({
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    controllerUrl: 'workflow/creative/creative_list_controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeListResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/creative/creative_preview_controller',
                    showHeader: false,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativePreviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/creative/creative_preview_controller',
                    showHeader: false,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativePreviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/campaign/:campaignId/ad/:adId/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/creative/creative_preview_controller',
                    showHeader: false,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativePreviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/campaign/:campaignId/ad/:adId/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/creative/creative_preview_controller',
                    showHeader: false,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativePreviewResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/help', angularAMD.route({
                    templateUrl: assets.html_help,
                    title: 'Help - Online',
                    showHeader: true,
                    controller: 'HelpController'
                }))

                .otherwise({redirectTo: '/'});

            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        })

        .config([
            '$locationProvider', function ($locationProvider) {
                return $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false
                }).hashPrefix('!');
            }
        ])

        .config(function (tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('/scripts/libs/angular-locale_{{locale}}.js');
        })

        .config(function (tagsInputConfigProvider) {
            tagsInputConfigProvider
                .setDefaults('tagsInput', {
                    placeholder: 'Add comma separated values or press enter for each entry',
                    minLength: 2,
                    displayProperty: 'label',
                    replaceSpacesWithDashes: false,
                    maxLength: 127
                });
        })

        .config(['$compileProvider', function ($compileProvider) {
            // https://docs.angularjs.org/guide/production
            $compileProvider.debugInfoEnabled(false);
        }])

        .run(function ($rootScope, $location, $cookies, loginModel, brandsModel, dataService, $cookieStore,
                       workflowService , subAccountService, $window) {

            var loginCheckFunc = function () {
                    var locationPath = $location.path(),
                        authorizationKey;

                    if (JSON.parse(localStorage.getItem('userObj'))) {
                        authorizationKey = JSON.parse(localStorage.getItem('userObj')).authorizationKey;
                    }

                    if (locationPath !== '/login') {
                        brandsModel.enable();
                    }

                    dataService.updateRequestHeader();

                    loginModel.checkCookieExpiry();

                    // if some one try to change the authorization key or delete the key manually
                    // this is getting after successful login.
                    if ($cookieStore.get('cdesk_session') && authorizationKey !== loginModel.getauth_token()) {
                        loginModel.unauthorized();
                    }
                },

                locationChangeStartFunc = $rootScope.$on('$locationChangeStart', function () {
                    workflowService.clearModuleInfo();
                    loginCheckFunc();
                }),

                routeChangeSuccessFunc = $rootScope.$on('$routeChangeSuccess', function (event, current) {
                    var currentRoute = current.$$route;

                    if (currentRoute) {
                        $rootScope.title = currentRoute.title;
                        $rootScope.bodyclass = currentRoute.bodyclass || '';
                        $rootScope.showHeader = currentRoute.showHeader;
                    }
                });

            $rootScope.version = version;

            $rootScope.$on('$destroy', function () {
                locationChangeStartFunc();
                routeChangeSuccessFunc();
            });

            // If the internet is disconnected or connected, we show a popup notification
            $rootScope.online = navigator.onLine;

            $window.addEventListener('offline', function () {
                $('html').append('<div class="slider-msg">You are offline now</div>');
                $('.slider-msg').show();

                setTimeout(function () {
                    $('.slider-msg').fadeOut('slow');
                }, 3000);

                $rootScope.$apply(function () {
                    $rootScope.online = false;
                });
            }, false);

            $window.addEventListener('online', function () {
                $('html').append('<div class="slider-msg">You are online now</div>');
                $('.slider-msg').show() ;

                setTimeout(function () {
                    $('.slider-msg').fadeOut('slow') ;
                }, 3000);

                $rootScope.$apply(function () {
                    $rootScope.online = true;
                });
            }, false);
        });

    return angularAMD.bootstrap(app);
});
