define(['common'], function (angularAMD) {
    angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
        .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 'ngFileUpload',
            function ($scope, $timeout, $transition, $q) {
        }])
        .directive('carousel', [function () {
            return {};
        }]);

    var app = angular.module('vistoApp', ['ngRoute', 'ngCookies', 'tmh.dynamicLocale', 'ui.bootstrap', 'uiSwitch',
        'door3.css', 'ngFileUpload', 'ngSanitize', 'ui.multiselect', 'highcharts-ng', 'ui.bootstrap.showErrors',
        'ngTagsInput']);

    var fetchCurrentAdvertiser = function($location, $route, advertiserModel) {
        var params = $route.current.params;
        advertiserModel.fetchAdvertiserList(params.subAccountId || params.accountId).then(function() {
            if (advertiserModel.allowedAdvertiser(params.advertiserId)) {

                var advertiser = advertiserModel.getSelectedAdvertiser();
                $('#advertiser_name_selected').text(advertiser.name);
                $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
            } else {
                console.log('advertiser not allowed');
                $location.url('/tmp');
            }
        });
    };

    var fetchCurrentBrand = function($location, $route, brandsModel) {
        var params = $route.current.params;
        brandsModel.fetchBrandList(params.subAccountId || params.accountId, params.advertiserId).then(function() {
            if (brandsModel.allowedBrand(params.brandId)) {
                var brand = brandsModel.getSelectedBrand();
                $('#brand_name_selected').text(brand.name);
                $('#brandsDropdown').attr('placeholder', brand.name).val('');
            } else {
                console.log('brand not allowed');
                $location.url('/tmp');
            }
        });
    };

    var dashboardHeaderResolver = function($q, $location, $route, accountService, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount(params.accountId)) {
                accountService.fetchAccountData(params.accountId).then(function() {
                    deferred.resolve();
                    if (params.advertiserId && params.brandId) {
                        // fetching the advertiser & brand before loading dashboard. See resolve function
                    } else {
                        // fetch the advertiser async
                        params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var dashboardHeaderResolver2 = function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                subAccountService.fetchDashboardSubAccountList($route.current.params.accountId).then(function() {
                    if (subAccountService.allowedDashboardSubAccount($route.current.params.subAccountId)) {
                        accountService.fetchAccountData(params.accountId).then(function() {
                            deferred.resolve();
                            if (params.advertiserId && params.brandId) {
                                // fetching the advertiser & brand before loading dashboard. See resolve function
                            } else {
                                // fetch the advertiser async
                                params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                            }
                        });
                    } else {
                        console.log('dashboard account not allowed');
                        $location.url('/tmp')
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var reportsHeaderResolver2 = function($q, $location, $route, accountService, subAccountService, 
        campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {

        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                subAccountService.fetchSubAccountList($route.current.params.accountId).then(function() {
                    if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                        accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                            var resolvedOtherDeferrer = false;
                            campaignSelectModel.fetchCampaign($route.current.params.subAccountId, $route.current.params.campaignId).then(function() {
                                if (resolvedOtherDeferrer) {
                                    deferred.resolve();
                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                                } else {
                                    resolvedOtherDeferrer = true;
                                }
                            }, function() {
                                deferred.reject('Mediaplan not found');
                            });
                            strategySelectModel.fetchStrategyList($route.current.params.subAccountId, $route.current.params.campaignId).then(function() {
                                if (strategySelectModel.allowedStrategy($route.current.params.lineitemId)) {
                                    // broadcast set strategy
                                } else {
                                    console.log('strategy not allowed');
                                    $location.url('/tmp');
                                }
                                if (resolvedOtherDeferrer) {
                                    deferred.resolve();
                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                                } else {
                                    resolvedOtherDeferrer = true;
                                }
                            }, function() {
                                console.log('strategies not found');
                            });
                        }, function() {
                            deferred.reject('Client data not found');
                        });
                    } else {
                        console.log('sub account not allowed');
                        $location.url('/tmp');
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp');
            }
        });
        return deferred.promise;
    },

    reportsHeaderResolver = function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, 
        advertiserModel, brandsModel) {

        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                    var resolvedOtherDeferrer = false;
                    campaignSelectModel.fetchCampaign($route.current.params.accountId, $route.current.params.campaignId).then(function() {
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                            params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function() {
                        deferred.reject('Mediaplan not found');
                    });
                    strategySelectModel.fetchStrategyList($route.current.params.accountId, $route.current.params.campaignId).then(function() {
                        if (strategySelectModel.allowedStrategy($route.current.params.lineitemId)) {
                            // broadcast set strategy
                        } else {
                            console.log('strategy not allowed');
                            $location.url('/tmp');
                        }
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                            params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function() {
                        console.log('strategies not found');
                    });
                }, function() {
                    deferred.reject('Client data not found');
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp');
            }
        });
        return deferred.promise;
    };

    // report header resolver without campaign id - we pick the campaign here
    var reportsHeaderResolverWOCampaign = function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                    var params = $route.current.params;
                    campaignSelectModel.fetchCampaigns(params.accountId, params.advertiserId || -1, params.brandId || -1).then(function(campaignsResponse) {
                        if (campaignsResponse && campaignsResponse.data.data) {
                            var campaign = campaignsResponse.data.data[0],
                                url = '/a/' + params.accountId;
                            if (campaign) {
                                url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                                url += '/mediaplans/' + campaign.campaign_id + '/' + params.reportName;
                            } else {
                                (params.advertiserId > 0) && (url += '/adv/' + params.advertiserId);
                                (params.advertiserId > 0) && (params.brandId > 0) && (url += '/b/' + params.brandId);
                                url += '/mediaplans'
                            }
                            console.log('url', url);
                            $location.url(url);
                        }
                        deferred.resolve();
                    });
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var reportsHeaderResolverWOCampaign2 = function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                subAccountService.fetchSubAccountList($route.current.params.accountId).then(function() {
                    if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                        accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                            var params = $route.current.params;
                            campaignSelectModel.fetchCampaigns(params.subAccountId, params.advertiserId || -1, params.brandId || -1).then(function(campaignsResponse) {
                                if (campaignsResponse && campaignsResponse.data.data) {
                                    var campaign = campaignsResponse.data.data[0],
                                        url = '/a/' + params.accountId + '/sa/' + params.subAccountId;
                                    if (campaign) {
                                        url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                                        url += '/mediaplans/' + campaign.campaign_id + '/' + params.reportName;
                                    } else {
                                        (params.advertiserId > 0) && (url += '/adv/' + params.advertiserId);
                                        (params.advertiserId > 0) && (params.brandId > 0) && (url += '/b/' + params.brandId);
                                        url += '/mediaplans'
                                    }
                                    console.log('url', url);
                                    $location.url(url);
                                }
                                deferred.resolve();
                                // fetchCurrentAdvertiser($location, $route, advertiserModel);
                                // fetchCurrentBrand($location, $route, brandsModel);
                            });
                        });
                    } else {
                        console.log('sub account not allowed');
                        $location.url('/tmp')
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var mediaplansHeaderResolver = function($q, $location, $route, accountService, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                    deferred.resolve();
                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var mediaplansHeaderResolver2 = function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                subAccountService.fetchSubAccountList($route.current.params.accountId).then(function() {
                    if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                        accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                            deferred.resolve();
                            params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                            params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                        });
                    } else {
                        console.log('dashboard account not allowed');
                        $location.url('/tmp')
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var uploadReportsHeaderResolver = function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                accountService.fetchAccountData($route.current.params.accountId).then(function() {
                    collectiveReportModel.getReportList(params.accountId, params.advertiserId || -1, params.brandId || -1, params.campaignId || -1).then(function(response) {
                        if (response && response.data.data) {
                            deferred.resolve(response.data.data);
                        } else {
                            deferred.resolve([]);
                        }
                        params.campaignId && campaignSelectModel.fetchCampaign(params.accountId, params.campaignId);
                        !params.campaignId && campaignSelectModel.setSelectedCampaign({id: -1, name: 'All Media Plans', kpi: 'ctr', startDate: '-1', endDate: '-1'});
                        params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                        params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                    });
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    var uploadReportsHeaderResolver2 = function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
        var deferred = $q.defer();

        var params = $route.current.params;
        accountService.fetchAccountList().then(function() {
            if (accountService.allowedAccount($route.current.params.accountId)) {
                subAccountService.fetchSubAccountList($route.current.params.accountId).then(function() {
                    if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                        accountService.fetchAccountData($route.current.params.accountId).then(function(response) {
                            collectiveReportModel.getReportList(params.subAccountId, params.advertiserId || -1, params.brandId || -1, params.campaignId || -1).then(function(response) {
                                if (response && response.data.data) {
                                    deferred.resolve(response.data.data);
                                } else {
                                    deferred.resolve([]);
                                }
                                params.campaignId && campaignSelectModel.fetchCampaign(params.subAccountId, params.campaignId);
                                !params.campaignId && campaignSelectModel.setSelectedCampaign({id: -1, name: 'All Media Plans', kpi: 'ctr', startDate: '-1', endDate: '-1'});
                                params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                                params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                            });
                        });
                    } else {
                        console.log('dashboard account not allowed');
                        $location.url('/tmp')
                    }
                });
            } else {
                console.log('account not allowed');
                $location.url('/tmp')
            }
        });
        return deferred.promise;
    };

    app.config(function ($routeProvider, $httpProvider) {
            $routeProvider.caseInsensitiveMatch = true;

            $routeProvider
                .when('/login', angularAMD.route({
                    templateUrl: assets.html_reports_login,
                    title: 'Login',
                    controller: 'loginController',
                    showHeader : false,
                    controllerUrl: 'login/login_controller'
                }))

                .when('/a/:accountId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return dashboardHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return dashboardHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel, $timeout) {
                            var deferrer = $q.defer(),
                                params = $route.current.params;
                            dashboardHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel).then(function() {
                                advertiserModel.fetchAdvertiserList(params.accountId).then(function() {
                                    if (advertiserModel.allowedAdvertiser(params.advertiserId)) {
                                        brandsModel.fetchBrandList(params.accountId, params.advertiserId).then(function() {
                                            if (brandsModel.allowedBrand(params.brandId)) {
                                                deferrer.resolve();
                                                $timeout(function() {
                                                    // hack -> wait till the dashboard (with header) page loads
                                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                                                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                                                }, 1000);
                                            } else {
                                                deferrer.reject('brand not allowed');
                                                console.log('brand not allowed');
                                                $location.url('/tmp');
                                            }
                                        });
                                    } else {
                                        deferrer.reject('advertiser not allowed');
                                        console.log('advertiser not allowed');
                                        $location.url('/tmp');
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
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return dashboardHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return dashboardHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    title: 'Dashboard',
                    showHeader : false,
                    bodyclass: 'dashboard_body',
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel, $timeout) {
                            var deferrer = $q.defer(),
                                params = $route.current.params;
                            dashboardHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel).then(function() {
                                advertiserModel.fetchAdvertiserList(params.subAccountId).then(function() {
                                    if (advertiserModel.allowedAdvertiser(params.advertiserId)) {
                                        brandsModel.fetchBrandList(params.subAccountId, params.advertiserId).then(function() {
                                            if (brandsModel.allowedBrand(params.brandId)) {
                                                deferrer.resolve();
                                                $timeout(function() {
                                                    // hack -> wait till the dashboard (with header) page loads
                                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel);
                                                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel);
                                                }, 1000);
                                            } else {
                                                deferrer.reject('brand not allowed');
                                                console.log('brand not allowed');
                                                $location.url('/tmp');
                                            }
                                        });
                                    } else {
                                        deferrer.reject('advertiser not allowed');
                                        console.log('advertiser not allowed');
                                        $location.url('/tmp');
                                    }
                                });
                            });

                            return deferrer.promise;
                        }
                    }
                }))
                // .when('/dashboard', angularAMD.route({
                //     templateUrl: assets.html_dashboard,
                //     controller: 'DashboardController',
                //     controllerUrl: 'reporting/dashboard/dashboard_controller',
                //     showHeader : true,
                //     title: 'Dashboard',
                //     bodyclass: 'dashboard_body',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('dashboard');
                //         }
                //     }
                // }))

                // .when('/dashboard_2', angularAMD.route({
                //     templateUrl: assets.html_dashboard_2,
                //     controller: 'DashboardController_2',
                //     showHeader : true,
                //     title: 'Dashboard 2.0',
                //     bodyclass: 'dashboard_2',
                //     resolve: {}
                // }))

                // .when('/mediaplans', angularAMD.route({
                //     templateUrl: assets.html_campaign_list,
                //     title: 'Media Plan List',
                //     reloadOnSearch : false,
                //     showHeader : true,
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('mediaplan_list');
                //         }
                //     }
                // }))

                .when('/a/:accountId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService,localStorageService) {
                        //     //redirects to default page if it has no permission to access it
                        //     featuresService.setGetFeatureParams('report_overview');
                        //     if(localStorageService.selectedCampaign.get() && localStorageService.selectedCampaign.get().id == -1)  {
                        //         $location.url('/mediaplans');
                        //     }
                        // }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName', angularAMD.route({
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details, 
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController', 
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService,  campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance, 
                    title: 'Reports - Performance',
                    controller: 'PerformanceController', 
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost', angularAMD.route({
                    templateUrl: assets.html_cost, 
                    title: 'Reports - Cost',
                    controller: 'CostController', 
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform', angularAMD.route({
                    templateUrl: assets.html_platform, 
                    title: 'Reports - Platform',
                    controller: 'PlatformController', 
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory, 
                    title: 'Reports - Inventory',
                    controller: 'InventoryController', 
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability, 
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController', 
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization, 
                    title: 'Reports - Optimization Impact', 
                    controller: 'OptimizationController', 
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details, 
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController', 
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService,  campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance, 
                    title: 'Reports - Performance',
                    controller: 'PerformanceController', 
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/cost', angularAMD.route({
                    templateUrl: assets.html_cost, 
                    title: 'Reports - Cost',
                    controller: 'CostController', 
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/platform', angularAMD.route({
                    templateUrl: assets.html_platform, 
                    title: 'Reports - Platform',
                    controller: 'PlatformController', 
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory, 
                    title: 'Reports - Inventory',
                    controller: 'InventoryController', 
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability, 
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController', 
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization, 
                    title: 'Reports - Optimization Impact', 
                    controller: 'OptimizationController', 
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/mediaplans/reports/:reportName', angularAMD.route({   
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService,localStorageService) {
                        //     //redirects to default page if it has no permission to access it
                        //     featuresService.setGetFeatureParams('report_overview');
                        //     if(localStorageService.selectedCampaign.get() && localStorageService.selectedCampaign.get().id == -1)  {
                        //         $location.url('/mediaplans');
                        //     }
                        // }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans/reports/:reportName', angularAMD.route({   
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/reports/:reportName', angularAMD.route({   
                    templateUrl: assets.html_campaign_reports,
                    title: 'Reports Overview',
                    controller: 'CampaignReportsController',
                    controllerUrl: 'reporting/controllers/campaign_reports_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolverWOCampaign2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details, 
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController', 
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/performance', angularAMD.route({
                    templateUrl: assets.html_performance, 
                    title: 'Reports - Performance',
                    controller: 'PerformanceController', 
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/cost', angularAMD.route({
                    templateUrl: assets.html_cost, 
                    title: 'Reports - Cost',
                    controller: 'CostController', 
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/platform', angularAMD.route({
                    templateUrl: assets.html_platform, 
                    title: 'Reports - Platform',
                    controller: 'PlatformController', 
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory, 
                    title: 'Reports - Inventory',
                    controller: 'InventoryController', 
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability, 
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController', 
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization, 
                    title: 'Reports - Optimization Impact', 
                    controller: 'OptimizationController', 
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_details, 
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController', 
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/performance', angularAMD.route({
                    templateUrl: assets.html_performance, 
                    title: 'Reports - Performance',
                    controller: 'PerformanceController', 
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/cost', angularAMD.route({
                    templateUrl: assets.html_cost, 
                    title: 'Reports - Cost',
                    controller: 'CostController', 
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/platform', angularAMD.route({
                    templateUrl: assets.html_platform, 
                    title: 'Reports - Platform',
                    controller: 'PlatformController', 
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory, 
                    title: 'Reports - Inventory',
                    controller: 'InventoryController', 
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/quality', angularAMD.route({
                    templateUrl: assets.html_viewability, 
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController', 
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/li/:lineitemId/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization, 
                    title: 'Reports - Optimization Impact', 
                    controller: 'OptimizationController', 
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, 
                            campaignSelectModel, strategySelectModel, advertiserModel, brandsModel) {
                            return reportsHeaderResolver2($q, $location, $route, accountService, subAccountService, 
                                campaignSelectModel, strategySelectModel, advertiserModel, brandsModel);
                       }
                    }
                }))
                .when('/a/:accountId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService) {
                        //     //redirects to default page if it has no permission to access it
                        //     featuresService.setGetFeatureParams('mediaplan_list');
                        // }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService) {
                        //     //redirects to default page if it has no permission to access it
                        //     featuresService.setGetFeatureParams('mediaplan_list');
                        // }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                    }
                }))
                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : false,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                    }
                }))

                .when('/a/:accountId/customreport', angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'reporting/controllers/custom_report_controller',
                    showHeader : true,
                    bodyclass: 'custom_report_page',
                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('scheduled_reports');
                        }
                    }
                }))

                .when('/a/:accountId/customreport/edit/:reportId', angularAMD.route({
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    controllerUrl: 'reporting/controllers/custom_report_controller',
                    showHeader : true,
                    bodyclass: 'custom_report_page',
                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('scheduled_reports');
                        }
                    }
                }))

                .when('/a/:accountId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService) {
                        //     featuresService.setGetFeatureParams('collective_insights');
                        // }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        header: function($q, $location, $route, accountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver($q, $location, $route, accountService, advertiserModel, brandsModel);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                        // check: function ($location, featuresService) {
                        //     featuresService.setGetFeatureParams('collective_insights');
                        // }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        header: function($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel) {
                            return mediaplansHeaderResolver2($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel);
                        }
                    }
                }))

                .when('/a/:accountId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                        // check: function ($location, featuresService) {
                        //     featuresService.setGetFeatureParams('collective_insights');
                        // }
                    }
                }))


                .when('/a/:accountId/adv/:advertiserId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                        // check: function ($location, featuresService) {
                        //     featuresService.setGetFeatureParams('collective_insights');
                        // }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/sa/:subAccountId/adv/:advertiserId/b/:brandId/mediaplans/:campaignId/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,
                    resolve: {
                        reportsList: function($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel) {
                            return uploadReportsHeaderResolver2($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel);
                        }
                    }
                }))

                .when('/a/:accountId/reports/schedules', angularAMD.route({
                    templateUrl: assets.html_reports_schedule_list,
                    title: 'Scheduled Reports',
                    controller: 'ReportsScheduleListController',
                    controllerUrl: 'reporting/collectiveReport/reports_schedule_list_controller',
                    showHeader : true,
                    css: assets.css_reports_schedule_list,
                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('scheduled_reports');
                        }
                    }
                }))
                // .when('/optimization', angularAMD.route({
                //     templateUrl: assets.html_optimization,
                //     title: 'Reports - Optimization Impact',
                //     controller: 'OptimizationController',
                //     controllerUrl: 'reporting/controllers/optimization_controller',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('optimization_transparency');
                //         }
                //     }
                // }))

                // .when('/inventory', angularAMD.route({
                //     templateUrl: assets.html_inventory,
                //     title: 'Reports - Inventory',
                //     controller: 'InventoryController',
                //     controllerUrl: 'reporting/controllers/inventory_controller',
                //     resolve: {
                //         check: function ($location, featuresService,workflowService) {
                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('inventory');
                //         }
                //     }
                // }))

                // .when('/quality', angularAMD.route({
                //     templateUrl: assets.html_viewability,
                //     title: 'Reports - Quality',
                //     controller: 'ViewabilityController',
                //     controllerUrl: 'reporting/controllers/viewability_controller',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('quality');
                //         }
                //     }
                // }))

                // .when('/cost', angularAMD.route({
                //     templateUrl: assets.html_cost,
                //     title: 'Reports - Cost',
                //     controller: 'CostController',
                //     controllerUrl: 'reporting/controllers/cost_controller',
                //     resolve: {
                //         check: function ($location, loginModel, featuresService) {
                //             // if  cost modal is opaque and some one trying to access cost direclty from the url
                //             var locationPath,
                //                 isAgencyCostModelTransparent;

                //             isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
                //             locationPath = $location.path();
                //             if (!isAgencyCostModelTransparent && locationPath === '/cost') {
                //                 $location.url('/');
                //             }

                //             //redirects to default page if it has no permission to access it
                //             featuresService.setGetFeatureParams('cost');
                //         }
                //     }
                // }))

                // .when('/platform', angularAMD.route({
                //     templateUrl: assets.html_platform,
                //     title: 'Reports - Platform',
                //     controller: 'PlatformController',
                //     controllerUrl: 'reporting/controllers/platform_controller',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('platform');
                //         }
                //     }
                //     //css: 'assets/stylesheets/platform.css'
                // }))

                // .when('/customreport', angularAMD.route({
                //     templateUrl: assets.html_custom_report,
                //     title: 'Report Builder',
                //     controller: 'CustomReportController',
                //     controllerUrl: 'reporting/controllers/custom_report_controller',
                //     showHeader : true,
                //     bodyclass: 'custom_report_page',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('scheduled_reports');
                //         }
                //     }
                // }))

                // .when('/customreport/edit/:reportId', angularAMD.route({
                //     templateUrl: assets.html_custom_report,
                //     title: 'Report Builder',
                //     controller: 'CustomReportController',
                //     controllerUrl: 'reporting/controllers/custom_report_controller',
                //     showHeader : true,
                //     bodyclass: 'custom_report_page',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('scheduled_reports');
                //         }
                //     }
                // }))

                // .when('/reports/upload', angularAMD.route({
                //     templateUrl: assets.html_custom_report_upload,
                //     title: 'Upload Custom Reports',
                //     controller: 'CustomReportUploadController',
                //     controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                //     showHeader : true,
                //     css: assets.css_custom_reports,
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('collective_insights');
                //         }
                //     }
                // }))

                // .when('/reports/list', angularAMD.route({
                //     templateUrl: assets.html_collective_report_listing,
                //     title: 'Collective Insights',
                //     controller: 'CollectiveReportListingController',
                //     controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                //     showHeader : true,
                //     css: assets.css_custom_reports,
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('collective_insights');
                //         }
                //     }
                // }))

                // .when('/reports/schedules', angularAMD.route({
                //     templateUrl: assets.html_reports_schedule_list,
                //     title: 'Scheduled Reports',
                //     controller: 'ReportsScheduleListController',
                //     controllerUrl: 'reporting/collectiveReport/reports_schedule_list_controller',
                //     showHeader : true,
                //     css: assets.css_reports_schedule_list,
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('scheduled_reports');
                //         }
                //     }
                // }))

                .when('/v1sto/invoices', angularAMD.route({
                    templateUrl: assets.html_reports_invoice_list,
                    title: 'Invoices Reports',
                    controller: 'ReportsInvoiceListController',
                    controllerUrl: 'reporting/collectiveReport/reports_invoice_list_controller',
                    showHeader : true,
                    css: assets.css_reports_invoice_list,
                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('scheduled_reports');
                        }
                    }
                }))

                .when('/v1sto/invoices/:invoiceId', angularAMD.route({
                    templateUrl: assets.html_reports_invoice,
                    title: 'Media Plan - Overview',
                    controller: 'reportsInvoiceController',
                    showHeader : true,
                    controllerUrl: 'reporting/collectiveReport/reports_invoice_controller',
                    css: assets.css_reports_invoice_list,
                    showHeader : true,
                    resolve: {
                    }
                }))

                // .when('/performance', angularAMD.route({
                //     templateUrl: assets.html_performance,
                //     title: 'Reports - Performance',
                //     controller: 'PerformanceController',
                //     controllerUrl: 'reporting/controllers/performance_controller',
                //     resolve: {
                //         check: function ($location, featuresService) {
                //             featuresService.setGetFeatureParams('performance');
                //         }
                //     }
                // }))

                .when('/mediaplan/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: '/scripts/workflow/controllers/campaign_create_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('create_mediaplan');
                            });

                            workflowService.setMode('create');
                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                redirect: false
                            });
                            featuresService.setGetFeatureParams('create_mediaplan');
                        }
                    }
                }))
                .when('/admin/home', angularAMD.route({
                    templateUrl: assets.html_admin_home,
                    title: 'AdminHome',
                    showHeader : true,
                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin){
                                $location.url('/dashboard');
                            }
                        }
                    }
                }))
                .when('/admin/accounts', angularAMD.route({
                    templateUrl: assets.html_accounts,
                    title: 'Accounts',
                    controller: 'AccountsController',
                    controllerUrl: 'common/controllers/accounts/accounts_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin){
                                $location.url('/dashboard');
                            }
                        }
                    }
                }))
                .when('/admin/users', angularAMD.route({
                    templateUrl: assets.html_users,
                    title: 'Users',
                    controller: 'UsersController',
                    controllerUrl: 'common/controllers/users/users_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin){
                                $location.url('/dashboard');
                            }
                        }
                    }
                }))
                .when('/admin/brands', angularAMD.route({
                    templateUrl: assets.html_brands,
                    title: 'AdminBrands',
                    controller: 'AdminAdvertisersController',
                    controllerUrl: 'common/controllers/accounts/admin_brands_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin){
                                $location.url('/dashboard');
                            }
                        }
                    }
                }))
                .when('/admin/advertisers', angularAMD.route({
                    templateUrl: assets.html_advertisers,
                    title: 'AdminAdvertisers',
                    controller: 'AdminUsersController',
                    controllerUrl: 'common/controllers/accounts/admin_advertisers_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin){
                                $location.url('/dashboard');
                            }
                        }
                    }
                }))
                .when('/mediaplan/:campaignId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Edit - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: 'workflow/controllers/campaign_create_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('mediaplan_hub');
                            });

                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                redirect: true
                            });
                            workflowService.setMode('edit');
                            featuresService.setGetFeatureParams('mediaplan_hub');
                        }
                    }
                }))

                .when('/mediaplan/:campaignId/overview', angularAMD.route({
                    templateUrl: assets.html_campaign_create_ad,
                    title: 'Media Plan - Overview',
                    controller: 'CampaignOverViewController',
                    controllerUrl: 'workflow/controllers/campaign_overview_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('mediaplan_hub');
                            });

                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE,
                                redirect: true
                            });
                            featuresService.setGetFeatureParams('mediaplan_hub');
                        }
                    }
                }))

                .when('/mediaplan/:campaignId/ads/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('ad_setup');
                            });

                            workflowService.setMode('create');
                            workflowService.setIsAdGroup(false);
                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                redirect: true
                            });
                            featuresService.setGetFeatureParams('ad_setup');
                        }
                    }
                }))

                .when('/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('mediaplan_hub');
                            });

                            workflowService.setMode('create');
                            workflowService.setIsAdGroup(true);
                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                redirect: true
                            });
                            featuresService.setGetFeatureParams('mediaplan_hub');
                        }
                    }
                }))

                .when('/mediaplan/:campaignId/ads/:adId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('ad_setup');
                            });

                            workflowService.setMode('edit');
                            workflowService.setIsAdGroup(false);
                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                redirect: true
                            });
                            featuresService.setGetFeatureParams('ad_setup');
                        }
                    }
                }))

                .when('/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit', angularAMD.route({
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('mediaplan_hub');
                            });

                            workflowService.setMode('edit');
                            workflowService.setIsAdGroup(true);
                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                redirect: true
                            });
                            featuresService.setGetFeatureParams('mediaplan_hub');
                        }
                    }
                }))

                .when('/creative/add', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Add Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/controllers/creative_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('creative_list');
                            });

                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                redirect: false
                            });
                            featuresService.setGetFeatureParams('creative_list');
                        }
                    }
                }))

                .when('/creative/:creativeId/edit', angularAMD.route({
                    templateUrl: assets.html_creative,
                    title: 'Edit Creative',
                    controller: 'CreativeController',
                    controllerUrl: 'workflow/controllers/creative_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('creative_list');
                            });
                            featuresService.setGetFeatureParams('creative_list');
                        }
                    }
                }))

                .when('/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/controllers/creative_preview_controller',
                    showHeader : false,
                    resolve: {
                        check: function ($location,  $rootScope) {
                        }
                    }
                }))

                .when('/creative/list', angularAMD.route({
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    controllerUrl: 'workflow/controllers/creative_list_controller',
                    showHeader : true,
                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            var featuredFeatures = $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('creative_list');
                            });

                            workflowService.setModuleInfo({
                                moduleName: 'WORKFLOW',
                                warningMsg: constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE,
                                redirect: false
                            });
                            featuresService.setGetFeatureParams('creative_list');
                        }
                    }
                }))

                .when('/help', angularAMD.route({
                    templateUrl: assets.html_help,
                    title: 'Help - Online',
                    showHeader : true,
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
                // enable the new HTML5 routing and history API
                // return $locationProvider.html5Mode(true).hashPrefix('!');
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

        .run(function ($rootScope, $location, $cookies, loginModel, brandsModel, dataService, $cookieStore,
                       workflowService, featuresService, subAccountModel, $window,localStorageService,constants) {
            var handleLoginRedirection = function () {
                var cookieRedirect = $cookieStore.get('cdesk_redirect') || null,
                    localStorageRedirect = localStorage.getItem('cdeskRedirect'),
                    setDefaultPage;

                    if (localStorageRedirect) {
                        cookieRedirect = localStorageRedirect;
                    }

                    if ($cookieStore.get('cdesk_session')) {
                        if (cookieRedirect) {
                            cookieRedirect = cookieRedirect.replace('/', '');
                        }
                        if (cookieRedirect && cookieRedirect !== 'dashboard') {
                            $location.url(cookieRedirect);
                            $cookieStore.remove('cdesk_redirect');
                            localStorage.removeItem('cdeskRedirect');
                        } else {
                            setDefaultPage = 'dashboard';
                            $location.url(setDefaultPage);
                        }
                    }
                },

                broadCastClientLoaded = function() {
                    $rootScope.$broadcast(constants.CLIENT_LOADED);
                },

                loginCheckFunc = function () {
                    var locationPath = $location.path(),
                        authorizationKey,
                        clientObj,
                        userObj;

                    if (JSON.parse(localStorage.getItem('userObj'))) {
                        authorizationKey = JSON.parse(localStorage.getItem('userObj')).authorizationKey;
                    }

                    if (locationPath !== '/login') {
                        brandsModel.enable();
                    }

                    dataService.updateRequestHeader();
                    if ((loginModel.getAuthToken()) && (localStorage.getItem('selectedClient') === null ||
                        localStorage.getItem('selectedClient') === undefined )) {
                        // userObj = RoleBasedService.getUserData().preferred_client;
                        // workflowService
                        //     .getClients()
                        //     .then(function (result) {
                        //         var matchedClientsobj;

                        //         if ((result && result.data.data.length > 0)) {
                        //             if (userObj && userObj.preferred_client) {
                        //                 matchedClientsobj = _.find(result.data.data, function (obj) {
                        //                     return obj.id === userObj.preferred_client;
                        //                 });
                        //             }

                        //             if (matchedClientsobj !== undefined) {
                        //                 clientObj = matchedClientsobj;
                        //             } else {
                        //                 clientObj = result.data.data[0];
                        //             }

                        //             localStorageService.masterClient.set({
                        //                 id: clientObj.id,
                        //                 name: clientObj.name,
                        //                 isLeafNode: clientObj.isLeafNode
                        //             });

                        //             if (clientObj.isLeafNode) {
                        //                 loginModel.setSelectedClient({
                        //                     id: clientObj.id,
                        //                     name: clientObj.name
                        //                 });

                        //                 workflowService
                        //                     .getClientData(clientObj.id)
                        //                     .then(function (response) {
                        //                         featuresService.setFeatureParams(response.data.data.features);
                        //                         broadCastClientLoaded();
                        //                     });

                        //                 if (locationPath === '/login' || locationPath === '/') {
                        //                     handleLoginRedirection();
                        //                 }
                        //             } else {
                        //                 //set subAccount
                        //                 subAccountModel.fetchSubAccounts('MasterClientChanged',function(){
                        //                     workflowService
                        //                         .getClientData(clientObj.id)
                        //                         .then(function (response) {
                        //                             featuresService.setFeatureParams(response.data.data.features);
                        //                             broadCastClientLoaded();
                        //                         });

                        //                     if (locationPath === '/login' || locationPath === '/') {
                        //                         handleLoginRedirection();
                        //                     }
                        //                 });
                        //             }
                        //         } //end of then if
                        // });
                    } else {
                        if (loginModel.getSelectedClient) {
                            if (locationPath === '/login' || locationPath === '/') {
                                handleLoginRedirection();
                            }
                        }
                    }

                    // if cookie is not set
                    if (!$cookieStore.get('cdesk_session')) {
                        if ($location.path() !== '/login') {
                            localStorage.setItem('cdeskRedirect', $location.url());
                        }
                        $location.url('/login');
                    }

                    // if some one try to change the authorization key or delete the key manually
                    // this is getting after successful login.
                    if ($cookieStore.get('cdesk_session') && authorizationKey !== loginModel.getAuthToken()) {
                        loginModel.unauthorized();
                    }
                },

                locationChangeStartFunc = $rootScope.$on('$locationChangeStart', function () {
                    workflowService.clearModuleInfo();
                    loginCheckFunc();
                }),

                routeChangeSuccessFunc = $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                    var currentRoute = current.$$route;


                    if (currentRoute) {
                        $rootScope.title = currentRoute.title;
                        $rootScope.bodyclass = currentRoute.bodyclass || '';
                        $rootScope.showHeader = currentRoute.showHeader;
                    }

                    if (loginModel.getLoginName()) {
                        //ga('set', 'dimension1', loginModel.getLoginName());
                    }

                    //if (!$cookieStore.get('cdesk_session')) {
                    //    //remove header bar on login page
                    //    $('.main_navigation_holder').hide();
                    //}
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
                setTimeout(function(){
                    $('.slider-msg').fadeOut('slow');
                }, 3000);
                $rootScope.$apply(function() {
                    $rootScope.online = false;
                });
            }, false);

            $window.addEventListener('online', function () {
                $('html').append('<div class="slider-msg">You are online now</div>');
                $('.slider-msg').show() ;
                setTimeout(function(){
                    $('.slider-msg').fadeOut('slow') ;
                }, 3000);
                $rootScope.$apply(function() {
                    $rootScope.online = true;
                });
            }, false);
        });

    return angularAMD.bootstrap(app);
});
