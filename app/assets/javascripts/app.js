/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

    angObj = angular.module('app',
        [
            'commonModule',
            'campaignListModule',
            'editActionsModule',
            'brandsModule',
            'campaignSelectModule',
            'strategySelectModule',
            'timePeriodModule',
            'loginModule',
            'kpiSelectModule',
            'angulartics',
            'angulartics.google.analytics',
            'dashboardModule',
            'ngSanitize',
            'ui.bootstrap',
            'uiSwitch',
            //'ngLocale',
            'tmh.dynamicLocale',
            'ngFileUpload',
            'lrInfiniteScroll',
            'door3.css',
            'collectiveReportModule'
        ]
    );


    angObj.config(function ($routeProvider, $httpProvider) {
            $routeProvider.when('/login', {
                templateUrl: assets.html_reports_login,
                controller: 'loginController'
            })
            .when('/campaigns', {
                templateUrl: function () {
                    var isWorkFlowUser = localStorage.userRoleObj && JSON.parse(localStorage.userRoleObj).workFlowUser;
                    var htmlTpl = assets.html_campaign_list;
                    if (isWorkFlowUser) {
                        htmlTpl = assets.html_workflow_campaign_list;
                    }
                    return htmlTpl;
                }
            })
            .when('/campaigns/:campaignId', {
                templateUrl: assets.html_campaign_details,
                title: 'Campaign Details',
                controller: 'CampaignDetailsController'
            })
            .when('/optimization', {
                templateUrl: assets.html_optimization,
                title: 'Reports - Optimization',
                controller: 'OptimizationController'
            })
            .when('/inventory', {
                templateUrl: assets.html_inventory,
                title: 'Reports - Inventory',
                controller: 'InventoryController'

            })
            .when('/quality', {
                templateUrl: assets.html_viewability,
                title: 'Reports - Quality',
                controller: 'viewabilityController'
            })
            .when('/cost', {
                templateUrl: assets.html_cost,
                title: 'Reports - Cost',
                controller: 'costController'
            })
            .when('/platform', {
                templateUrl: assets.html_platform,
                title: 'Reports - Platform',
                controller: 'platformController'
                //css: 'assets/stylesheets/platform.css'
            })
            .when('/customreport', {
                templateUrl: assets.html_custom_report,
                title: 'Custom Report',
                controller: 'customReportController'
            })
            .when('/reports/upload', {
                templateUrl: assets.html_custom_report_upload,
                title: 'Upload Custom Reports',
                controller: 'customReportUploadController',
                css: assets.css_custom_reports
            })
            .when('/reports/list', {
                templateUrl: assets.html_collective_report_listing,
                title: 'collective report listing',
                controller: 'CollectiveReportListingController',
                css: assets.css_custom_reports
            })
            .when('/performance', {
                templateUrl: assets.html_performance,
                title: 'Reports - Performance',
                controller: 'performanceController'
            })
            .when('/campaign/create', {
                templateUrl: assets.html_campaign_create,
                title: 'Create - Campaign',
                controller: 'CreateCampaignController',
                //   css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }
            })
            .when('/campaign/:campaignId/edit', {
                            templateUrl: assets.html_campaign_create,
                            title :  'Create - Campaign',
                            controller: 'CreateCampaignController',
                         //   css: assets.css_visto_application,
                            resolve:{
                                "check":function($location, loginModel){
                                    var isWorkflowUser = RoleBasedService.getUserRole().workFlowUser
                                    if(!isWorkflowUser){
                                        $location.path('/');
                                    }
                                }
                            }
             })
            .when('/campaign/:campaignId/overview', {
                templateUrl: assets.html_campaign_create_ad,
                title: 'Campaign - Overview',
                controller: 'CampaignOverViewController',
                //     css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }
            })
            .when('/campaign/:campaignId/ads/create', {
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Campaign - Ad Create',
                controller: 'CampaignAdsCreateController',
                //  css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }
            })
            .when('/campaign/:campaignId/adGroup/:adGroupId/ads/create', {
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Campaign - Ad Create',
                controller: 'CampaignAdsCreateController',
                //  css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }
            })
            .when('/creative/add', {
                templateUrl: assets.html_creative,
                title: 'Add Creative',
                // css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }
            })
            .when('/creative/list', {
                templateUrl: assets.html_creative_list,
                title: 'Creative List',
                controller: 'creativeListController',
                //  css: assets.css_visto_application,
                resolve: {
                    "check": function ($location, loginModel) {
                        var isWorkflowUser = loginModel.getIsWorkflowUser();
                        if (!isWorkflowUser) {
                            $location.path('/');
                        }
                    }
                }

            })
            .when('/help', {
                templateUrl: assets.html_help,
                title: 'Help - Online',
                controller: 'helpController'
            })
            .otherwise({redirectTo: '/'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }).config([
        "$locationProvider", function ($locationProvider) {
            return $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }).hashPrefix("!"); // enable the new HTML5 routing and history API
            // return $locationProvider.html5Mode(true).hashPrefix("!"); // enable the new HTML5 routing and history API
        }
    ]).config(function (tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('/assets/javascripts/vendor/i18n/angular-locale_{{locale}}.js');
    });

    angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService, $cookieStore, constants, RoleBasedService, $locale, tmhDynamicLocale) {
        $rootScope.version = version;


        var handleLoginRedirection = function (isNetworkUser, isWorkflowUser) {
            var cookieRedirect = $cookieStore.get(constants.COOKIE_REDIRECT) || null;

            if ($cookieStore.get(constants.COOKIE_SESSION)) {
                var setDefaultPage;
                if (cookieRedirect) {
                    cookieRedirect = cookieRedirect.replace("/", '');
                }
                if ((isNetworkUser || isWorkflowUser) && cookieRedirect && cookieRedirect !== 'dashboard') {
                    $location.url(cookieRedirect);
                    $cookieStore.remove(constants.COOKIE_REDIRECT);
                } else {
                    setDefaultPage = (isNetworkUser || isWorkflowUser) ? 'campaigns' : 'dashboard';
                    $location.url(setDefaultPage);
                }
            }
        }

        var loginCheckFunc = function () {

            if (RoleBasedService.getUserRole()) {
                if (!RoleBasedService.getUserRole().i18n) { //if i18n is not there in json.forcing to logout.
                    loginModel.unauthorized();
                }
                var isWorkflowUser = loginModel.getIsWorkflowUser();
                var isNetworkUser = loginModel.getIsNetworkUser();
                var authorizationKey = RoleBasedService.getUserRole().authorizationKey;
                var locale = RoleBasedService.getUserRole().locale || 'en-us';
                tmhDynamicLocale.set(locale)
                $rootScope.$locale = 'locale';
            }
            $rootScope.productType = isWorkflowUser ? 'workflow' : 'reporting';

            var locationPath = $location.path();
            if (locationPath !== '/login') {
                brandsModel.enable();
            }
            dataService.updateRequestHeader();

            /**** if cookie is not set ***/
            if (!$cookieStore.get(constants.COOKIE_SESSION)) {
                $location.url('/login');
            }
            /* if  cost modal is opaque and some one trying to access cost direclty from the url */
            var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
            if (!isAgencyCostModelTransparent && locationPath === '/cost') {
                $location.url((isNetworkUser || isWorkflowUser) ? 'campaigns' : 'dashboard');
            }

            /* if some one try to change the authorization key or delete the key manually*/
            // this is getting after successful login.
            if ($cookieStore.get(constants.COOKIE_SESSION) && authorizationKey !== loginModel.getAuthToken()) {
                loginModel.unauthorized();
            }

            /* this function will execute when location path is either login or /,
             case- submit login button, cookie expire aur unauthorize */

            if (locationPath === '/login' || locationPath === '/') {
                handleLoginRedirection(isNetworkUser, isWorkflowUser);
            }

            /*
             if some one manually try to change the url when logged in as network user
             will check from cookie if its a network user then will redirect to deafult page which in this is campaign;
             */

            if ((isNetworkUser || isWorkflowUser) && locationPath === '/dashboard') {
                $location.url('campaigns');
            }
        }

        var locationChangeStartFunc = $rootScope.$on('$locationChangeStart', function () {
            $rootScope.bodyclass = '';
            loginCheckFunc();
        });

        var routeChangeSuccessFunc = $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            var locationPath = $location.path();
            $rootScope.bodyclass = '';

            var setPageTitle = function () {
                var currentRoute = current.$$route;
                if (currentRoute) {
                    switch (locationPath) {
                        case '/login' :
                            currentRoute.title = 'Login';
                            break;
                        case '/campaigns' :
                            currentRoute.title = 'Campaign List';
                            break;
                        case '/dashboard' :
                            currentRoute.title = 'Dashboard';
                            $rootScope.bodyclass = 'dashboard_body';
                            break;
                        case '/customreport' :
                            $rootScope.bodyclass = 'custom_report_page';
                            break;
                    }
                    $rootScope.title = currentRoute.title;
                }
            }

            setPageTitle();
            if (loginModel.getLoginName()) {
                ga('set', 'dimension1', loginModel.getLoginName());
            }
        });

        $rootScope.$on('$destroy', function () {
            locationChangeStartFunc();
            routeChangeSuccessFunc();
        });


    });
}());