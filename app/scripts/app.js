define(['common'], function (angularAMD) {
    'use strict';

    angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
        .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 'ngFileUpload',
            function () {}])
        .directive('carousel', [function () {
            return {};
        }]);

    var app = angular.module('vistoApp', ['ngRoute', 'ngCookies', 'tmh.dynamicLocale', 'ui.bootstrap', 'uiSwitch',
        'door3.css', 'ngFileUpload', 'ngSanitize', 'ui.multiselect', 'highcharts-ng', 'ui.bootstrap.showErrors',
        'ngTagsInput']);

    app
        .config(function ($routeProvider, $httpProvider) {
            $routeProvider.caseInsensitiveMatch = true;

            $routeProvider
                .when('/login', angularAMD.route({
                    templateUrl: assets.html_reports_login,
                    title: 'Login',
                    controller: 'loginController',
                    showHeader : false,
                    controllerUrl: 'login/login_controller'
                }))

                .when('/dashboard', angularAMD.route({
                    templateUrl: assets.html_dashboard,
                    controller: 'DashboardController',
                    controllerUrl: 'reporting/dashboard/dashboard_controller',
                    showHeader : true,
                    title: 'Dashboard',
                    bodyclass: 'dashboard_body',

                    resolve: {
                        check: function ($location, featuresService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('dashboard');
                        }
                    }
                }))

                .when('/dashboard_2', angularAMD.route({
                    templateUrl: assets.html_dashboard_2,
                    controller: 'DashboardController_2',
                    title: 'Dashboard 2.0',
                    showHeader : true,
                    bodyclass: 'dashboard_2',
                    resolve: {}
                }))

                .when('/mediaplans', angularAMD.route({
                    templateUrl: assets.html_campaign_list,
                    title: 'Media Plan List',
                    reloadOnSearch : false,
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('mediaplan_list');
                        }
                    }
                }))

                .when('/mediaplans/:campaignId', angularAMD.route({
                    templateUrl: assets.html_campaign_details,
                    title: 'Reports Overview',
                    controller: 'CampaignDetailsController',
                    controllerUrl: 'reporting/controllers/campaign_details_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService,localStorageService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('report_overview');
                            if(localStorageService.selectedCampaign.get() &&
                                localStorageService.selectedCampaign.get().id === -1)  {
                                $location.url('/mediaplans');
                            }
                        }
                    }
                }))

                .when('/optimization', angularAMD.route({
                    templateUrl: assets.html_optimization,
                    title: 'Reports - Optimization Impact',
                    controller: 'OptimizationController',
                    controllerUrl: 'reporting/controllers/optimization_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('optimization_transparency');
                        }
                    }
                }))

                .when('/inventory', angularAMD.route({
                    templateUrl: assets.html_inventory,
                    title: 'Reports - Inventory',
                    controller: 'InventoryController',
                    controllerUrl: 'reporting/controllers/inventory_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('inventory');
                        }
                    }
                }))

                .when('/quality', angularAMD.route({
                    templateUrl: assets.html_viewability,
                    title: 'Reports - Quality',
                    controller: 'ViewabilityController',
                    controllerUrl: 'reporting/controllers/viewability_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('quality');
                        }
                    }
                }))

                .when('/cost', angularAMD.route({
                    templateUrl: assets.html_cost,
                    title: 'Reports - Cost',
                    controller: 'CostController',
                    controllerUrl: 'reporting/controllers/cost_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, loginModel, featuresService) {
                            // if cost modal is opaque and some one trying to access cost direclty from the url
                            var locationPath,
                                isAgencyCostModelTransparent;

                            isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
                            locationPath = $location.path();

                            if (!isAgencyCostModelTransparent && locationPath === '/cost') {
                                $location.url('/');
                            }

                            // redirects to default page if it has no permission to access it
                            featuresService.setGetFeatureParams('cost');
                        }
                    }
                }))

                .when('/platform', angularAMD.route({
                    templateUrl: assets.html_platform,
                    title: 'Reports - Platform',
                    controller: 'PlatformController',
                    controllerUrl: 'reporting/controllers/platform_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('platform');
                        }
                    }
                }))

                .when('/customreport', angularAMD.route({
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

                .when('/customreport/edit/:reportId', angularAMD.route({
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

                .when('/reports/upload', angularAMD.route({
                    templateUrl: assets.html_custom_report_upload,
                    title: 'Upload Custom Reports',
                    controller: 'CustomReportUploadController',
                    controllerUrl: 'reporting/controllers/custom_report_upload_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,

                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('collective_insights');
                        }
                    }
                }))

                .when('/reports/list', angularAMD.route({
                    templateUrl: assets.html_collective_report_listing,
                    title: 'Collective Insights',
                    controller: 'CollectiveReportListingController',
                    controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
                    showHeader : true,
                    css: assets.css_custom_reports,

                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('collective_insights');
                        }
                    }
                }))

                .when('/reports/schedules', angularAMD.route({
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
                    resolve: {}
                }))

                .when('/performance', angularAMD.route({
                    templateUrl: assets.html_performance,
                    title: 'Reports - Performance',
                    controller: 'PerformanceController',
                    controllerUrl: 'reporting/controllers/performance_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService) {
                            featuresService.setGetFeatureParams('performance');
                        }
                    }
                }))

                .when('/mediaplan/create', angularAMD.route({
                    templateUrl: assets.html_campaign_create,
                    title: 'Create - Media Plan',
                    controller: 'CreateCampaignController',
                    controllerUrl: '/scripts/workflow/controllers/campaign_create_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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

                    resolve: {
                        check: function ($location, loginModel) {
                            if(!loginModel.getClientData().is_super_admin) {
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
                            if(!loginModel.getClientData().is_super_admin) {
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
                            if(!loginModel.getClientData().is_super_admin) {
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
                            if(!loginModel.getClientData().is_super_admin) {
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
                            if(!loginModel.getClientData().is_super_admin) {
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
                            $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/overview/campaign_overview_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/ad/ad_create_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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

                .when('/mediaplan/:campaignId/lineItem/:lineItemId/adGroup/:adGroupId/ads/:adId/edit', angularAMD
                    .route({
                        templateUrl: assets.html_campaign_create_adBuild,
                        title: 'Media Plan - Ad Edit',
                        controller: 'CampaignAdsCreateController',
                        controllerUrl: 'workflow/ad/ad_create_controller',
                        showHeader : true,

                        resolve: {
                            check: function ($location, workflowService, constants, featuresService, $rootScope) {
                                $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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
                    controllerUrl: 'workflow/creative/creative_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
                                featuresService.setGetFeatureParams('creative_list');
                            });

                            featuresService.setGetFeatureParams('creative_list');
                        }
                    }
                }))

                .when('/clientId/:clientId/adv/:advertiserId/creative/:creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/controllers/creative_preview_controller',
                    showHeader : false,

                    resolve: {
                        check: function () {}
                    }
                }))

                .when('/clientId/:clientId/adv/:advertiserId/campaignId/:campaignId/adId/:adId/creative/' +
                    ':creativeId/preview', angularAMD.route({
                    templateUrl: assets.html_creative_preview,
                    title: 'Preview Creative',
                    controller: 'CreativePreviewController',
                    controllerUrl: 'workflow/controllers/creative_preview_controller',
                    showHeader : false,

                    resolve: {
                        check: function () {}
                    }
                }))


                .when('/creative/list', angularAMD.route({
                    templateUrl: assets.html_creative_list,
                    title: 'Creative List',
                    controller: 'CreativeListController',
                    controllerUrl: 'workflow/creative/creative_list_controller',
                    showHeader : true,

                    resolve: {
                        check: function ($location, workflowService, constants, featuresService, $rootScope) {
                            $rootScope.$on('features', function () {
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
                    if ((loginModel.getauth_token()) && (localStorage.getItem('selectedClient') === null ||
                        localStorage.getItem('selectedClient') === undefined )) {
                        userObj = JSON.parse(localStorage.getItem('userObj'));

                        workflowService
                            .getClients()
                            .then(function (result) {
                                var matchedClientsobj;

                                if ((result && result.data.data.length > 0)) {
                                    if (userObj && userObj.preferred_client) {
                                        matchedClientsobj =
                                            _.find(result.data.data, function (obj) {
                                            return obj.id === userObj.preferred_client;
                                        });
                                    }

                                    if (matchedClientsobj !== undefined) {
                                        clientObj = matchedClientsobj;
                                    } else {
                                        clientObj = result.data.data[0];
                                    }

                                    localStorageService.masterClient.set({
                                        id: clientObj.id,
                                        name: clientObj.name,
                                        isLeafNode: clientObj.isLeafNode
                                    });

                                    if (clientObj.isLeafNode) {
                                        loginModel.setSelectedClient({
                                            id: clientObj.id,
                                            name: clientObj.name
                                        });

                                        workflowService
                                            .getClientData(clientObj.id)
                                            .then(function (response) {
                                                featuresService.setFeatureParams(response.data.data.features);
                                                broadCastClientLoaded();
                                            });

                                        if (locationPath === '/login' || locationPath === '/') {
                                            handleLoginRedirection();
                                        }
                                    } else {
                                        // set subAccount
                                        subAccountModel.fetchSubAccounts('MasterClientChanged',function() {
                                            workflowService
                                                .getClientData(clientObj.id)
                                                .then(function (response) {
                                                    featuresService.setFeatureParams(response.data.data.features);
                                                    broadCastClientLoaded();
                                                });

                                            if (locationPath === '/login' || locationPath === '/') {
                                                handleLoginRedirection();
                                            }
                                        });
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
                    if (!$cookieStore.get('cdesk_session')) {
                        if ($location.path() !== '/login') {
                            localStorage.setItem('cdeskRedirect', $location.url());
                        }

                        $location.url('/login');
                    }

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

                setTimeout(function() {
                    $('.slider-msg').fadeOut('slow');
                }, 3000);

                $rootScope.$apply(function() {
                    $rootScope.online = false;
                });
            }, false);

            $window.addEventListener('online', function () {
                $('html').append('<div class="slider-msg">You are online now</div>');
                $('.slider-msg').show() ;

                setTimeout(function() {
                    $('.slider-msg').fadeOut('slow') ;
                }, 3000);

                $rootScope.$apply(function() {
                    $rootScope.online = true;
                });
            }, false);
        });

    return angularAMD.bootstrap(app);
});
