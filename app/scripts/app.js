define(['common'], function (angularAMD) {
    'use strict';

    angular
        .module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
        .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 'ngFileUpload', function () {}])
        .directive('carousel', [function () {
            return {};
        }]);

    var app = angular.module('vistoApp', ['ngRoute', 'ngCookies', 'tmh.dynamicLocale', 'ui.bootstrap', 'uiSwitch', 'door3.css', 'ngFileUpload',
        'ngSanitize', 'ui.multiselect', 'highcharts-ng', 'ui.bootstrap.showErrors', 'ngTagsInput', 'visto.templates']);

    app
        .config(function ($routeProvider, $httpProvider) {
            var rp = $routeProvider;
            rp.caseInsensitiveMatch = true;

            rp
                .when('/', angularAMD.route({
                    title: 'Loading...',
                    templateUrl: assets.html_home,
                    controller: function ($scope, $cookies, $location, RoleBasedService, dataService, accountService, urlBuilder) {
                        var preferredClientId;

                        if ($cookies.get('cdesk_session')) {
                            preferredClientId = RoleBasedService.getUserData().preferred_client;
                            dataService.updateRequestHeader();

                            accountService
                                .fetchAccountList()
                                .then(function () {
                                    var account,
                                        features;

                                    if (preferredClientId) {
                                        account = _.find(accountService.getAccounts(), function (client) {
                                            return client.id === preferredClientId;
                                        });

                                        if (!account) {
                                            account = accountService.getAccounts()[0];
                                        }
                                    } else {
                                        account = accountService.getAccounts()[0];
                                    }

                                    if (accountService.allowedAccount(account.id)) {
                                        accountService
                                            .fetchAccountData(account.id)
                                            .then(function (response) {
                                                features = response.data.data.features;

                                                if (features.indexOf('ENABLE_ALL') !== -1) {
                                                    $location.url(urlBuilder.buildBaseUrl(account.id) + '/dashboard');
                                                } else {

                                                    if (features.indexOf('DASHBOARD') !== -1) {
                                                        $location.url(urlBuilder.buildBaseUrl(account.id) + '/dashboard');
                                                    } else {
                                                        urlBuilder.mediaPlansListUrl(account.id);
                                                    }
                                                }
                                            });
                                    }
                                });
                        }
                    },

                    showHeader: true
                }))

                .when('/login', angularAMD.route({
                    templateUrl: assets.html_login,
                    title: 'Login',
                    controller: 'loginController',
                    controllerAs : 'login',
                    showHeader: false,
                    controllerUrl: 'login-controller'
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'dashboard-controller',
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
                                                routeResolversParams.$location.url('/tmp');
                                            }
                                        });
                                });

                            return deferrer.promise;
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'dashboard-controller',
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

                                                //To fetch branch we have to send the selected advertisers clientId
                                                var subAccountId = routeResolversParams.advertiserModel.getSelectedAdvertiser().clientId;

                                                routeResolversParams
                                                    .brandsModel
                                                    .fetchBrandList(subAccountId, params.advertiserId)
                                                    .then(function () {
                                                        if (routeResolversParams.brandsModel.allowedBrand(params.brandId)) {
                                                            deferrer.resolve();

                                                            $timeout(function () { // jshint:ignore
                                                                // hack -> wait till the dashboard (with header) page loads
                                                                params.advertiserId && routeResolvers.fetchCurrentAdvertiser(routeResolversParams);
                                                                params.advertiserId && params.brandId && routeResolvers.fetchCurrentBrand(routeResolversParams,subAccountId);
                                                            }, 1000);
                                                        } else {
                                                            deferrer.reject('brand not allowed');
                                                            console.log('brand not allowed');
                                                            routeResolversParams.$location.url('/tmp');
                                                        }
                                                    });
                                            } else {
                                                deferrer.reject('advertiser not allowed');
                                                routeResolversParams.$location.url('/tmp');
                                            }
                                        });
                                });

                            return deferrer.promise;
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/vendor/create', angularAMD.route({
                    templateUrl: assets.html_vendor_config,
                    title: 'Create - Vendor Configuration',
                    controller: 'VendorConfigController',
                    controllerUrl: 'vendor-config-controller',
                    controllerAs: 'vendor',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/vendors/list', angularAMD.route({
                    templateUrl: assets.html_vendors_config_list,
                    title: 'Vendors Configuration - List',
                    controller: 'VendorsConfigListController',
                    controllerUrl: 'vendors-config-list-controller',
                    showHeader: true,
                    css: assets.css_table_list
                }))

                .when('/help', angularAMD.route({
                    templateUrl: assets.html_help,
                    title: 'Help - Online',
                    showHeader: true,
                    controller: 'HelpController'
                }))

                .when('/auditLogViewer', angularAMD.route({
                    templateUrl: assets.html_audit_dashboard,
                    title: 'Audit DashBoard',
                    controller: 'entityAuditCtrl',
                    showHeader: false,
                    controllerUrl: 'audit-controller'
                }))

                .otherwise({redirectTo: '/'});

            [
                '/a/:accountId/dashboard',
                '/a/:accountId/adv/:advertiserId/dashboard'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'dashboard-controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/dashboard',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/dashboard'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'dashboard-controller',
                    title: 'Dashboard',
                    showHeader: true,
                    bodyclass: 'dashboard_body',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.dashboardHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/mediaplans/reports/:reportName',
                '/a/:accountId/adv/:advertiserId/mediaplans/reports/:reportName',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'campaign-reports-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/mediaplans/reports/:reportName',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans/reports/:reportName',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'campaign-reports-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolverWOCampaign2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'campaign-details-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/overview',
                '/a/:accountId/mediaplans/:campaignId/overview',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'campaign-details-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/performance',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/performance'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'performance-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/performance',
                '/a/:accountId/mediaplans/:campaignId/performance',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'performance-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/cost',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/cost'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'cost-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost',
                '/a/:accountId/mediaplans/:campaignId/cost',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/cost',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/cost'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'cost-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/platform',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/platform'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'platform-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/platform',
                '/a/:accountId/mediaplans/:campaignId/platform',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/platform'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'platform-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/inventory',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/inventory'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'inventory-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/inventory',
                '/a/:accountId/mediaplans/:campaignId/inventory',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/inventory'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'inventory-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/quality',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/quality'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'viewability-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/quality',
                '/a/:accountId/mediaplans/:campaignId/quality',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/quality'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'viewability-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'optimization-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/optimization',
                '/a/:accountId/mediaplans/:campaignId/optimization',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization',
                '/a/:accountId/mediaplans/:campaignId/li/:lineitemId/optimization',
                '/a/:accountId/sa/:subAccountId/mediaplans/:campaignId/li/:lineitemId/optimization'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'optimization-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.reportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/mediaplans',
                '/a/:accountId/adv/:advertiserId/mediaplans',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/mediaplans',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/reports/schedules'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_reports_schedule_list,
                    title: 'Scheduled Reports',
                    controller: 'ReportsScheduleListController',
                    controllerUrl: 'reports-schedule-list-controller',
                    showHeader: true,
                    css: assets.css_reports_schedule_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.scheduleReportListCreateResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/customreport'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'custom-report-controller',
                    showHeader: true,
                    bodyclass: 'custom_report_page',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.scheduleReportListCreateResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/customreport/edit/:reportId'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'custom-report-controller',
                    showHeader: true,
                    bodyclass: 'custom_report_page',

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/reports/upload'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'custom-report-upload-controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/reports/upload'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'custom-report-upload-controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/reports/upload',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/upload',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/reports/upload'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'custom-report-upload-controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlansHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/reports/list',
                '/a/:accountId/adv/:advertiserId/reports/list',
                '/a/:accountId/adv/:advertiserId/b/:brandId/reports/list',
                '/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'collective-report-listing-controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/reports/list',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/list',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/reports/list',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'collective-report-listing-controller',
                    showHeader: true,
                    css: assets.css_custom_reports,

                    resolve: {
                        reportsList: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.uploadReportsHeaderResolver2(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/v1sto/invoices',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/v1sto/invoices',
                '/a/:accountId/v1sto/invoices',
                '/a/:accountId/adv/:advertiserId/b/:brandId/v1sto/invoices'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_reports_invoice_list,
                    title: 'Invoices Reports',
                    controller: 'ReportsInvoiceListController',
                    controllerUrl: 'reports-invoice-list-controller',
                    showHeader: true,
                    css: assets.css_reports_invoice_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.invoiceHeader(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/v1sto/invoices/:invoiceId',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/v1sto/invoices/:invoiceId',
                '/a/:accountId/v1sto/invoices/:invoiceId',
                '/a/:accountId/adv/:advertiserId/b/:brandId/v1sto/invoices/:invoiceId'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_reports_invoice,
                    title: 'Media Plan - Overview',
                    controller: 'reportsInvoiceController',
                    controllerUrl: 'reports-invoice-controller',
                    showHeader: true,
                    css: assets.css_reports_invoice_list,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.invoiceHeader(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/admin/accounts',
                '/a/:accountId/sa/:subAccountId/admin/accounts'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_accounts,
                    title: 'Accounts',
                    controller: 'AccountsController',
                    controllerUrl: 'accounts-controller',
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/admin/users',
                '/a/:accountId/sa/:subAccountId/admin/users'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_users,
                    title: 'Users',
                    controller: 'UsersController',
                    controllerUrl: 'users-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/admin/brands',
                '/a/:accountId/sa/:subAccountId/admin/brands'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_brands,
                    title: 'AdminBrands',
                    controller: 'AdminAdvertisersController',
                    controllerUrl: 'admin-brands-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/admin/advertisers',
                '/a/:accountId/sa/:subAccountId/admin/advertisers'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_advertisers,
                    title: 'AdminAdvertisers',
                    controller: 'AdminUsersController',
                    controllerUrl: 'admin-advertisers-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adminHeaderResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/mediaplan/create',
                '/a/:accountId/sa/:subAccountId/mediaplan/create'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'campaign-create-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'create');
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/mediaplan/:campaignId/edit',
                '/a/:accountId/mediaplan/:campaignId/edit'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Edit - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'campaign-create-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams,routeResolvers) {
                            return routeResolvers.mediaPlanCreateResolver(routeResolversParams, 'edit');
                        }
                    }
                }));
            });


            [
                '/a/:accountId/mediaplan/:campaignId/overview',
                '/a/:accountId/sa/:subAccountId/mediaplan/:campaignId/overview'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_create_ad,
                    title: 'Media Plan - Overview',
                    controller: 'CampaignOverViewController',
                    controllerUrl: 'campaign-overview-controller',
                    showHeader: true,
                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.mediaPlanOverviewResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/create',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/create'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'ad-create-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            // TODO: Check out this method's implementation
                            return routeResolvers.adsResolver(routeResolversParams, 'create');
                        }
                    }
                }));
            });

            [
                '/a/:accountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'ad-create-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.adsResolver(routeResolversParams, 'edit');
                        }
                    }
                }));
            });

            [
                '/a/:accountId/creative/add',
                '/a/:accountId/adv/:advertiserId/creative/add',
                '/a/:accountId/sa/:subAccountId/creative/add',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/creative/add'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Add Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'creative-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/creative/:creativeId/edit',
                '/a/:accountId/adv/:advertiserId/creative/:creativeId/edit',
                '/a/:accountId/sa/:subAccountId/creative/:creativeId/edit',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/creative/:creativeId/edit'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Edit Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'creative-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/creative/list',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/creative/list',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/creative/list',
                '/a/:accountId/creative/list',
                '/a/:accountId/adv/:advertiserId/creative/list',
                '/a/:accountId/adv/:advertiserId/b/:brandId/creative/list'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    controllerUrl: 'creative-list-controller',
                    showHeader: true,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativeListResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/creative/:creativeId/preview',
                '/a/:accountId/adv/:advertiserId/creative/:creativeId/preview',
                '/a/:accountId/sa/:subAccountId/adv/:advertiserId/campaign/:campaignId/ad/:adId/creative/:creativeId/preview',
                '/a/:accountId/adv/:advertiserId/campaign/:campaignId/ad/:adId/creative/:creativeId/preview'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'creative-preview-controller',
                    showHeader: false,

                    resolve: {
                        header: function (routeResolversParams, routeResolvers) {
                            return routeResolvers.creativePreviewResolver(routeResolversParams);
                        }
                    }
                }));
            });

            [
                '/IAS_tagValidator',
                '/MOAT_tagValidator'
            ].forEach(function(path) {
                rp.when(path, angularAMD.route({
                    templateUrl: assets.html_tag_preview,
                    title: 'Tag Validator',
                    controller: 'TagPreviewController',
                    standAlone: true,
                    controllerUrl: 'tag-preview-controller'
                }));
            });

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

        .run(function ($rootScope, $location, loginModel, brandsModel, dataService, workflowService , subAccountService, $window) {

            var loginCheckFunc = function () {
                    var locationPath = $location.path();

                    if (locationPath !== '/login') {
                        brandsModel.enable();
                    }

                    dataService.updateRequestHeader();
                    loginModel.checkCookieExpiry();
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
