define(['common'], function (angularAMD) {

    angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
        .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 'ngFileUpload', function ($scope, $timeout, $transition, $q) {
        }]).directive('carousel', [function () {
        return {}
    }]);

    var app = angular.module('vistoApp', ['ngRoute', 'ngCookies', 'tmh.dynamicLocale', 'ui.bootstrap', 'uiSwitch', 'door3.css', 'ngFileUpload', 'ngSanitize', 'ui.multiselect', 'highcharts-ng', 'ui.bootstrap.showErrors', 'ngTagsInput']);

    app.config(function ($routeProvider, $httpProvider) {
        $routeProvider.caseInsensitiveMatch = true;

        $routeProvider
            .when('/login', angularAMD.route({
                templateUrl: assets.html_reports_login,
                title: 'Login',
                controller: 'loginController',
                controllerUrl: 'login/login_controller'
            }))
            .when('/dashboard', angularAMD.route({
                templateUrl: assets.html_dashboard,
                controller: 'DashboardController',
                controllerUrl: 'reporting/dashboard/dashboard_controller',
                title: 'Dashboard',
                bodyclass: 'dashboard_body',
                resolve: {
                    'check': function ($location,featuresService) {
                        //redirects to default page if it has no permission to access it
                        featuresService.setGetFeatureParams('dashboard');
                    }
                }
            }))
            .when('/dashboard_2', angularAMD.route({
                templateUrl: assets.html_dashboard_2,
                controller: 'DashboardController_2',
                title: 'Dashboard 2.0',
                bodyclass: 'dashboard_2',
                resolve: {}
            }))

            .when('/mediaplans', angularAMD.route({
                templateUrl: assets.html_campaign_list,
                title: 'Media Plan List',
                resolve: {
                    'check': function ($location,featuresService) {
                        //redirects to default page if it has no permission to access it
                        featuresService.setGetFeatureParams('mediaplan_list');
                    }
                }
            }))

            .when('/mediaplans/:campaignId', angularAMD.route({
                templateUrl: assets.html_campaign_details,
                title: 'Reports Overview',
                controller: 'CampaignDetailsController',
                controllerUrl: 'reporting/controllers/campaign_details_controller',
                resolve: {
                    'check': function ($location,featuresService) {
                        //redirects to default page if it has no permission to access it
                        featuresService.setGetFeatureParams('report_overview');
                    }
                }
            }))

            .when('/optimization', angularAMD.route({
                templateUrl: assets.html_optimization,
                title: 'Reports - Optimization Impact',
                controller: 'OptimizationController',
                controllerUrl: 'reporting/controllers/optimization_controller',
                resolve: {
                    'check': function ($location,featuresService) {
                        //redirects to default page if it has no permission to access it
                        featuresService.setGetFeatureParams('optimization_transparency');
                    }
                }
            }))

            .when('/inventory', angularAMD.route({
                templateUrl: assets.html_inventory,
                title: 'Reports - Inventory',
                controller: 'InventoryController',
                controllerUrl: 'reporting/controllers/inventory_controller',
                resolve: {
                    'check': function ($location,featuresService,workflowService) {
                             //redirects to default page if it has no permission to access it
                              featuresService.setGetFeatureParams('inventory');

                    }
                }
            }))

            .when('/quality', angularAMD.route({
                templateUrl: assets.html_viewability,
                title: 'Reports - Quality',
                controller: 'ViewabilityController',
                controllerUrl: 'reporting/controllers/viewability_controller',
                resolve: {
                    'check': function ($location,featuresService) {
                                //redirects to default page if it has no permission to access it
                                featuresService.setGetFeatureParams('quality');
                    }
                }
            }))

            .when('/cost', angularAMD.route({
                templateUrl: assets.html_cost,
                title: 'Reports - Cost',
                controller: 'CostController',
                controllerUrl: 'reporting/controllers/cost_controller',
                resolve: {
                    'check': function ($location, loginModel,featuresService) {
                                // if  cost modal is opaque and some one trying to access cost direclty from the url
                                var   locationPath,
                                    isAgencyCostModelTransparent;

                                isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
                                locationPath = $location.path();
                                if (!isAgencyCostModelTransparent && locationPath === '/cost') {
                                    $location.url('/');
                                }

                                //redirects to default page if it has no permission to access it
                                featuresService.setGetFeatureParams('cost');
                    }
                }
            }))

            .when('/platform', angularAMD.route({
                templateUrl: assets.html_platform,
                title: 'Reports - Platform',
                controller: 'PlatformController',
                controllerUrl: 'reporting/controllers/platform_controller',
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('platform');
                    }
                }
                //css: 'assets/stylesheets/platform.css'
            }))

            .when('/customreport', angularAMD.route({
                templateUrl: assets.html_custom_report,
                title: 'Report Builder',
                controller: 'CustomReportController',
                controllerUrl: 'reporting/controllers/custom_report_controller',
                bodyclass: 'custom_report_page',
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('scheduled_reports');
                    }
                }
            }))

            .when('/customreport/edit/:reportId', angularAMD.route({
                templateUrl: assets.html_custom_report,
                title: 'Report Builder',
                controller: 'CustomReportController',
                controllerUrl: 'reporting/controllers/custom_report_controller',
                bodyclass: 'custom_report_page',
                resolve: {
                    'check': function ($location, featuresService) {
                        featuresService.setGetFeatureParams('scheduled_reports');
                    }
                }
            }))

            .when('/reports/upload', angularAMD.route({
                templateUrl: assets.html_custom_report_upload,
                title: 'Upload Custom Reports',
                controller: 'CustomReportUploadController',
                controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                css: assets.css_custom_reports,
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('collective_insights');
                    }
                }
            }))

            .when('/reports/list', angularAMD.route({
                templateUrl: assets.html_collective_report_listing,
                title: 'Collective Insights',
                controller: 'CollectiveReportListingController',
                controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                css: assets.css_custom_reports,
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('collective_insights');
                    }
                }
            }))

            .when('/reports/schedules', angularAMD.route({
                templateUrl: assets.html_reports_schedule_list,
                title: 'Scheduled Reports',
                controller: 'ReportsScheduleListController',
                controllerUrl: 'reporting/collectiveReport/reports_schedule_list_controller',
                css: assets.css_reports_schedule_list,
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('scheduled_reports');
                    }
                }
            }))

            .when('/performance', angularAMD.route({
                templateUrl: assets.html_performance,
                title: 'Reports - Performance',
                controller: 'PerformanceController',
                controllerUrl: 'reporting/controllers/performance_controller',
                resolve: {
                    'check': function ($location,featuresService) {
                        featuresService.setGetFeatureParams('performance');
                    }
                }
            }))

            .when('/mediaplan/create', angularAMD.route({
                templateUrl: assets.html_campaign_create,
                title: 'Create - Media Plan',
                controller: 'CreateCampaignController',
                controllerUrl: '/scripts/workflow/controllers/campaign_create_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                                workflowService.setMode('create');
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                    'redirect': false
                                });
                                featuresService.setGetFeatureParams('create_mediaplan');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('create_mediaplan');
                                });
                    }
                }
            }))

            .when('/admin/home', angularAMD.route({
                templateUrl: assets.html_admin_home,
                title: 'AdminHome'
             //   controller: 'AccountsController',
             //   controllerUrl: 'common/controllers/accounts/accounts_controller'
            }))
            .when('/admin/accounts', angularAMD.route({
                templateUrl: assets.html_accounts,
                title: 'Accounts',
                controller: 'AccountsController',
                controllerUrl: 'common/controllers/accounts/accounts_controller'
            }))

            .when('/admin/users', angularAMD.route({
                templateUrl: assets.html_users,
                title: 'Users',
                controller: 'UsersController',
                controllerUrl: 'common/controllers/users/users_controller'
            }))
            .when('/admin/brands', angularAMD.route({
                templateUrl: assets.html_brands,
                title: 'AdminBrands',
                controller: 'AdminAdvertisersController',
                controllerUrl: 'common/controllers/accounts/admin_brands_controller'
            }))
            .when('/admin/advertisers', angularAMD.route({
                templateUrl: assets.html_advertisers,
                title: 'AdminAdvertisers',
                controller: 'AdminUsersController',
                controllerUrl: 'common/controllers/accounts/admin_advertisers_controller'
            }))
            .when('/mediaplan/:campaignId/edit', angularAMD.route({
                templateUrl: assets.html_campaign_create,
                title: 'Edit - Media Plan',
                controller: 'CreateCampaignController',
                controllerUrl: 'workflow/controllers/campaign_create_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE,
                                    'redirect': true
                                });
                                workflowService.setMode('edit');
                                featuresService.setGetFeatureParams('mediaplan_hub');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('mediaplan_hub');
                                });
                    }
                }
            }))

            .when('/mediaplan/:campaignId/overview', angularAMD.route({
                templateUrl: assets.html_campaign_create_ad,
                title: 'Media Plan - Overview',
                controller: 'CampaignOverViewController',
                controllerUrl: 'workflow/controllers/campaign_overview_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                        workflowService.setModuleInfo({
                            'moduleName': 'WORKFLOW',
                            'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE,
                            'redirect': true
                        });
                        featuresService.setGetFeatureParams('mediaplan_hub');
                        var featuredFeatures = $rootScope.$on('features', function () {
                            featuresService.setGetFeatureParams('mediaplan_hub');
                        });
                    }
                }
            }))

            .when('/mediaplan/:campaignId/ads/create', angularAMD.route({
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Media Plan - Ad Create',
                controller: 'CampaignAdsCreateController',
                controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                        workflowService.setMode('create');
                        workflowService.setIsAdGroup(false);
                        workflowService.setModuleInfo({
                            'moduleName': 'WORKFLOW',
                            'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                            'redirect': true
                        });
                        featuresService.setGetFeatureParams('ad_setup');
                        var featuredFeatures = $rootScope.$on('features', function () {
                            featuresService.setGetFeatureParams('ad_setup');
                        });
                    }
                }
            }))

            .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/create', angularAMD.route({
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Media Plan - Ad Create',
                controller: 'CampaignAdsCreateController',
                controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                                workflowService.setMode('create');
                                workflowService.setIsAdGroup(true);
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                    'redirect': true
                                });
                                featuresService.setGetFeatureParams('mediaplan_hub');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('mediaplan_hub');
                                });
                    }
                }
            }))

            .when('/mediaplan/:campaignId/ads/:adId/edit', angularAMD.route({
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Media Plan - Ad Edit',
                controller: 'CampaignAdsCreateController',
                controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                                workflowService.setMode('edit');
                                workflowService.setIsAdGroup(false)
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                    'redirect': true
                                });
                                featuresService.setGetFeatureParams('ad_setup');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('ad_setup');
                                });
                    }
                }
            }))

            .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/:adId/edit', angularAMD.route({
                templateUrl: assets.html_campaign_create_adBuild,
                title: 'Media Plan - Ad Edit',
                controller: 'CampaignAdsCreateController',
                controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                                workflowService.setMode('edit');
                                workflowService.setIsAdGroup(true);
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                    'redirect': true
                                });
                                featuresService.setGetFeatureParams('mediaplan_hub');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('mediaplan_hub');
                                });
                    }
                }
            }))

            .when('/creative/add', angularAMD.route({
                templateUrl: assets.html_creative,
                title: 'Add Creative',
                controller: 'CreativeController',
                controllerUrl: 'workflow/controllers/creative_controller',
                resolve: {
                    'check': function ($location,workflowService,constants,featuresService,$rootScope) {
                                workflowService.setModuleInfo({
                                    'moduleName': 'WORKFLOW',
                                    'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE,
                                    'redirect': false
                                });
                                featuresService.setGetFeatureParams('creative_list');
                                var featuredFeatures = $rootScope.$on('features', function () {
                                    featuresService.setGetFeatureParams('creative_list');
                                });
                    }
                }
            }))

            .when('/creative/:creativeId/edit', angularAMD.route({
                templateUrl: assets.html_creative,
                title: 'Edit Creative',
                controller: 'CreativeController',
                controllerUrl: 'workflow/controllers/creative_controller',
                resolve: {
                    'check': function ($location,featuresService,$rootScope) {
                        featuresService.setGetFeatureParams('creative_list');
                        var featuredFeatures = $rootScope.$on('features', function () {
                            featuresService.setGetFeatureParams('creative_list');
                        });
                    }
                }
            }))

            .when('/creative/list', angularAMD.route({
                templateUrl: assets.html_creative_list,
                title: 'Creative List',
                controller: 'CreativeListController',
                controllerUrl: 'workflow/controllers/creative_list_controller',
                resolve: {
                    'check': function ($location, workflowService, constants,featuresService,$rootScope) {
                        workflowService.setModuleInfo({
                            'moduleName': 'WORKFLOW',
                            'warningMsg': constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE,
                            'redirect': false
                        });
                        featuresService.setGetFeatureParams('creative_list');
                        var featuredFeatures = $rootScope.$on('features', function () {
                            featuresService.setGetFeatureParams('creative_list');
                        });
                    }
                }
            }))

            .when('/help', angularAMD.route({
                templateUrl: assets.html_help,
                title: 'Help - Online',
                controller: 'HelpController'
            }))


            .otherwise({redirectTo: '/'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

    }).config([
        '$locationProvider', function ($locationProvider) {
            return $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }).hashPrefix('!');
            // enable the new HTML5 routing and history API
            // return $locationProvider.html5Mode(true).hashPrefix('!');
        }
    ]).config(function (tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('/scripts/libs/angular-locale_{{locale}}.js');
    }).config(function (tagsInputConfigProvider) {
            tagsInputConfigProvider
                .setDefaults('tagsInput', {
                    placeholder: 'Add labels',
                    minLength: 2,
                    displayProperty: 'label',
                    replaceSpacesWithDashes: false,
                    maxLength: 127
                })

        })
        .run(function ($rootScope, $location, $cookies, loginModel, brandsModel, dataService, $cookieStore, workflowService,featuresService,subAccountModel, $window) {
            var handleLoginRedirection = function () {
                    var cookieRedirect = $cookieStore.get('cdesk_redirect') || null,
                        setDefaultPage;

                    if ($cookieStore.get('cdesk_session')) {
                        if (cookieRedirect) {
                            cookieRedirect = cookieRedirect.replace('/', '');
                        }
                        if (cookieRedirect && cookieRedirect !== 'dashboard') {
                            $location.url(cookieRedirect);
                            $cookieStore.remove('cdesk_redirect');
                        } else {
                            setDefaultPage = 'dashboard';
                            $location.url(setDefaultPage);
                        }
                    }
                },
                loginCheckFunc = function () {
                    var locationPath = $location.path(),
                        authorizationKey;



                    if (JSON.parse(localStorage.getItem('userObj'))) {
                        authorizationKey = JSON.parse(localStorage.getItem('userObj')).authorizationKey;
                    }
                    if (locationPath !== '/login') {
                        brandsModel.enable();
                    }

                    var clientObj;
                    dataService.updateRequestHeader();
                    if ((loginModel.getAuthToken()) && (localStorage.getItem('selectedClient') === null || localStorage.getItem('selectedClient') == undefined )) {
                        var userObj = JSON.parse(localStorage.getItem("userObj"));
                        workflowService
                            .getClients()
                            .then(function (result) {
                                if ((result && result.data.data.length > 0)) {
                                    if(userObj.preferred_client){
                                        var matchedClientsobj = _.find(result.data.data, function (obj) {
                                            return obj.id === userObj.preferred_client;
                                        });
                                    }
                                    if(matchedClientsobj !== undefined) {
                                        clientObj = matchedClientsobj;
                                    } else {
                                        clientObj = result.data.data[0];
                                    }
                                    loginModel.setMasterClient({'id':clientObj.id,'name':clientObj.name,'isLeafNode':clientObj.isLeafNode});

                                    if(clientObj.isLeafNode) {
                                        loginModel.setSelectedClient({'id':clientObj.id,'name':clientObj.name});
                                        workflowService.getClientData(clientObj.id).then(function (response) {
                                            featuresService.setFeatureParams(response.data.data.features);
                                        });
                                        if (locationPath === '/login' || locationPath === '/') {
                                            handleLoginRedirection();
                                        }
                                    } else {
                                        //set subAccount
                                        subAccountModel.fetchSubAccounts('MasterClientChanged',function(){
                                            workflowService.getClientData(clientObj.id).then(function (response) {
                                                featuresService.setFeatureParams(response.data.data.features);
                                            });
                                                if (locationPath === '/login' || locationPath === '/') {
                                                    handleLoginRedirection();
                                                }
                                         });
                                    }
                                }//end of then if
                            });
                    } else {
                        if (loginModel.getSelectedClient) {
                            if (locationPath === '/login' || locationPath === '/') {
                                handleLoginRedirection();
                            }
                        }
                    }

                    // if cookie is not set
                    if (!$cookieStore.get('cdesk_session')) {
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
                    }
                    if (loginModel.getLoginName()) {
                        //ga('set', 'dimension1', loginModel.getLoginName());
                    }

                    if (!$cookieStore.get('cdesk_session')) {
                        //remove header bar on login page
                        $('.main_navigation_holder').hide();
                    }
                });

            $rootScope.version = version;
            $rootScope.$on('$destroy', function () {
                locationChangeStartFunc();
                routeChangeSuccessFunc();
            });

            // If the internet is disconnected or connected, we show a popup notification

            $rootScope.online = navigator.onLine;

            $window.addEventListener("offline", function () {
                $("html").append("<div class='slider-msg'>You are offline now</div>");
                $(".slider-msg").show() ;
                setTimeout(function(){
                    $(".slider-msg").fadeOut("slow") ;
                }, 3000);
                $rootScope.$apply(function() {
                  $rootScope.online = false;
                });
              }, false);


              $window.addEventListener("online", function () {

                $("html").append("<div class='slider-msg'>You are online now</div>");
                $(".slider-msg").show() ;
                setTimeout(function(){
                    $(".slider-msg").fadeOut("slow") ;
                }, 3000);
                $rootScope.$apply(function() {
                  $rootScope.online = true;
                });
              }, false);
        });

    return angularAMD.bootstrap(app);
});
