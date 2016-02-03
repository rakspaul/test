// global angular, api
var angObj = '';
(function () {
    'use strict';

    angObj = angular.module('app',
        [
            'commonModule',
            'campaignListModule',
            'editActionsModule',
            'brandsModule',
            'advertiserModule',
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

    angObj
        .config(function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: assets.html_reports_login,
                    title : 'Login',
                    controller: 'LoginController'
                })

                .when('/dashboard', {
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    title : 'Dashboard',
                    bodyclass : 'dashboard_body',
                    resolve: {}
                })
                
                .when('/dashboard_2', {
                    templateUrl: assets.html_dashboard_2,
                    controller: 'DashboardController',
                    title : 'Dashboard 2.0',
                    bodyclass : 'dashboard_2',
                    resolve: {}
                })

                .when('/mediaplans', {
                    templateUrl: assets.html_campaign_list,
                    title : 'Media Plan List'
                })

                .when('/mediaplans/:campaignId', {
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
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
                    controller: 'ViewabilityController'
                })

                .when('/cost', {
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    resolve: {
                        'check': function ($location, RoleBasedService, loginModel) {
                            // if  cost modal is opaque and some one trying to access cost direclty from the url
                            var isWorkflowUser,
                                locationPath,
                                isAgencyCostModelTransparent;

                            isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;
                            isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
                            locationPath = $location.path();
                            if (!isAgencyCostModelTransparent && locationPath === '/cost') {
                                $location.url('/');
                            }
                        }
                    }
                })

                .when('/platform', {
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController'
                    //css: 'assets/stylesheets/platform.css'
                })

                .when('/customreport', {
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    bodyclass : 'custom_report_page'
                })

                .when('/customreport/edit/:reportId', {
                    templateUrl: assets.html_custom_report,
                    title: 'Report Builder',
                    controller: 'CustomReportController',
                    bodyclass : 'custom_report_page'
                })

                .when('/reports/upload', {
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    css: assets.css_custom_reports
                })

                .when('/reports/list', {
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    css: assets.css_custom_reports
                })

                .when('/reports/schedules', {
                    templateUrl: assets.html_reports_schedule_list,
                    title: 'Scheduled Reports',
                    controller: 'ReportsScheduleListController',
                    css: assets.css_reports_schedule_list
                })

                .when('/performance', {
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController'
                })

                .when('/mediaplan/create', {
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    resolve: {
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setMode('create');
                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                'redirect' : false
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/admin/accounts', {
                    templateUrl: assets.html_accounts,
                    title: 'Accounts',
                    controller: 'AccountsController'
                })

                .when('/admin/users', {
                    templateUrl: assets.html_users,
                    title: 'Users',
                    controller: 'UsersController'
                })

                .when('/mediaplan/:campaignId/edit', {
                    templateUrl: assets.html_campaign_create,
                    title :  'Edit - Media Plan',
                    controller: 'CreateCampaignController',
                    resolve:{
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                'redirect' : true
                            });
                            workflowService.setMode('edit');
                            if(!isWorkflowUser){
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/mediaplan/:campaignId/overview', {
                    templateUrl: assets.html_campaign_create_ad,
                    title: 'Media Plan - Overview',
                    controller: 'CampaignOverViewController',
                    resolve: {
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE,
                                'redirect' : true
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/mediaplan/:campaignId/ads/create', {
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    resolve: {
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setMode('create');
                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE ,
                                'redirect' : true
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/create', {
                    templateUrl: assets.html_campaign_create_adBuild,
                    title: 'Media Plan - Ad Create',
                    controller: 'CampaignAdsCreateController',
                    resolve: {
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setMode('create');
                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                'redirect' : true
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/mediaplan/:campaignId/ads/:adId/edit', {
                    templateUrl: assets.html_campaign_create_adBuild,
                    title :  'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    resolve:{
                        'check': function ($location, RoleBasedService, workflowService, constants) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setMode('edit');
                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE ,
                                'redirect' : true
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/:adId/edit', {
                    templateUrl: assets.html_campaign_create_adBuild,
                    title :  'Media Plan - Ad Edit',
                    controller: 'CampaignAdsCreateController',
                    resolve:{
                        'check': function($location, RoleBasedService, workflowService, constants){
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            workflowService.setMode('edit');
                            workflowService.setModuleInfo({
                                'moduleName' : 'WORKFLOW',
                                'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE ,
                                'redirect' : true
                            });
                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/creative/add', {
                    templateUrl: assets.html_creative,
                    title: 'Add Creative',
                    resolve: {
                        'check': function ($location, RoleBasedService) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/creative/list', {
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    resolve: {
                        'check': function ($location, RoleBasedService) {
                            var isWorkflowUser =
                                RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                            if (!isWorkflowUser) {
                                $location.path('/');
                            }
                        }
                    }
                })

                .when('/help', {
                    templateUrl: assets.html_help,
                    title: 'Help - Online',
                    controller: 'HelpController'
                })

                .otherwise({
                    redirectTo: '/'
                });

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
            tmhDynamicLocaleProvider.localeLocationPattern('/assets/javascripts/vendor/i18n/angular-locale_{{locale}}.js');
        })
        .run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService,
                         $cookieStore, constants, RoleBasedService, workflowService) {
            var handleLoginRedirection = function () {
                    var cookieRedirect = $cookieStore.get(constants.COOKIE_REDIRECT) || null,
                        setDefaultPage;

                    if ($cookieStore.get(constants.COOKIE_SESSION)) {
                        if (cookieRedirect) {
                            cookieRedirect = cookieRedirect.replace('/', '');
                        }
                        if (cookieRedirect && cookieRedirect !== 'dashboard') {
                            $location.url(cookieRedirect);
                            $cookieStore.remove(constants.COOKIE_REDIRECT);
                        } else {
                            setDefaultPage = 'dashboard';
                            $location.url(setDefaultPage);
                        }
                    }
                },
                loginCheckFunc = function () {
                    var locationPath = $location.path(),
                        authorizationKey;

                    if (RoleBasedService.getUserData()) {
                        authorizationKey = RoleBasedService.getUserData().authorizationKey;
                    }
                    if (locationPath !== '/login') {
                        brandsModel.enable();
                    }

                    dataService.updateRequestHeader();
                    if ((loginModel.getAuthToken()) && (localStorage.getItem('selectedClient') === null ||
                        localStorage.getItem('selectedClient') == undefined )) {
                        workflowService
                            .getClients()
                            .then(function (result) {
                                if (result && result.data.data.length >0) {
                                    loginModel.setSelectedClient({
                                        'id': result.data.data[0].children[0].id,
                                        'name': result.data.data[0].children[0].name
                                    });
                                    if (locationPath === '/login' || locationPath === '/') {
                                        handleLoginRedirection();
                                    }
                                }
                            });
                    } else {
                        if (loginModel.getSelectedClient) {
                            if (locationPath === '/login' || locationPath === '/') {
                                handleLoginRedirection();
                            }
                        }
                    }

                    // if cookie is not set
                    if (!$cookieStore.get(constants.COOKIE_SESSION)) {
                        $location.url('/login');
                    }

                    // if some one try to change the authorization key or delete the key manually
                    // this is getting after successful login.
                    if ($cookieStore.get(constants.COOKIE_SESSION) && authorizationKey !== loginModel.getAuthToken()) {
                        loginModel.unauthorized();
                    }

                    /* this function will execute when location path is either login or /,
                     case- submit login button, cookie expire aur unauthorize */

                    /*if (locationPath === '/login' || locationPath === '/') {
                        handleLoginRedirection(isNetworkUser, isWorkflowUser);
                    }*/
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
                    }
                    if (loginModel.getLoginName()) {
                        ga('set', 'dimension1', loginModel.getLoginName());
                    }
                });

            $rootScope.version = version;
            $rootScope.$on('$destroy', function () {
                locationChangeStartFunc();
                routeChangeSuccessFunc();
            });
        });
}());