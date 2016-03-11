define(['common'], function (angularAMD) {

    angular.module( 'ui.bootstrap.carousel' ,  [ 'ui.bootstrap.transition' ])
        .controller ( 'CarouselController' ,  [ '$scope' ,  '$timeout' ,  '$transition' ,  '$q' ,'ngFileUpload' , function  ( $scope ,  $timeout ,  $transition ,  $q )  {
        }]).directive ( 'carousel' ,  [ function ()  {
        return  {
        }
    }]);

  var app = angular.module('vistoApp', ['ngRoute', 'ngCookies','tmh.dynamicLocale','ui.bootstrap', 'uiSwitch', 'door3.css','ngFileUpload', 'ngSanitize','ui.multiselect','highcharts-ng', 'ui.bootstrap.showErrors', 'ngTagsInput']);

  app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/login', angularAMD.route({
          templateUrl: assets.html_reports_login,
          title: 'Login',
          controller: 'loginController',
          controllerUrl: 'login/login_controller',
        }))
      .when('/dashboard', angularAMD.route({
        templateUrl: assets.html_dashboard,
        controller: 'DashboardController',
        controllerUrl: 'reporting/dashboard/dashboard_controller',
        title : 'Dashboard',
        bodyclass : 'dashboard_body',
        resolve: {}
      }))
      .when('/dashboard_2', angularAMD.route({
        templateUrl: assets.html_dashboard_2,
        controller: 'DashboardController_2',
        title : 'Dashboard 2.0',
        bodyclass : 'dashboard_2',
        resolve: {}
      }))

      .when('/mediaplans', angularAMD.route({
        templateUrl: assets.html_campaign_list,
        title : 'Media Plan List'
      }))

      .when('/mediaplans/:campaignId', angularAMD.route({
        templateUrl: assets.html_campaign_details,
        title: 'Reports Overview',
        controller: 'CampaignDetailsController',
        controllerUrl: 'reporting/controllers/campaign_details_controller'
      }))

      .when('/optimization', angularAMD.route({
        templateUrl: assets.html_optimization,
        title: 'Reports - Optimization Impact',
        controller: 'OptimizationController',
        controllerUrl: 'reporting/controllers/optimization_controller'
      }))

      .when('/inventory', angularAMD.route({
        templateUrl: assets.html_inventory,
        title: 'Reports - Inventory',
        controller: 'InventoryController',
        controllerUrl: 'reporting/controllers/inventory_controller'
      }))

      .when('/quality', angularAMD.route({
        templateUrl: assets.html_viewability,
        title: 'Reports - Quality',
        controller: 'ViewabilityController',
        controllerUrl: 'reporting/controllers/viewability_controller'
      }))

      .when('/cost', angularAMD.route({
        templateUrl: assets.html_cost,
        title: 'Reports - Cost',
        controller: 'CostController',
        controllerUrl: 'reporting/controllers/cost_controller',
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
      }))

      .when('/platform', angularAMD.route({
        templateUrl: assets.html_platform,
        title: 'Reports - Platform',
        controller: 'PlatformController',
        controllerUrl: 'reporting/controllers/platform_controller'
        //css: 'assets/stylesheets/platform.css'
      }))

      .when('/customreport', angularAMD.route({
        templateUrl: assets.html_custom_report,
        title: 'Report Builder',
        controller: 'CustomReportController',
        controllerUrl: 'reporting/controllers/custom_report_controller',
        bodyclass : 'custom_report_page'
      }))

      .when('/customreport/edit/:reportId', angularAMD.route({
        templateUrl: assets.html_custom_report,
        title: 'Report Builder',
        controller: 'CustomReportController',
        controllerUrl: 'reporting/controllers/custom_report_controller',
        bodyclass : 'custom_report_page'
      }))

      .when('/reports/upload', angularAMD.route({
        templateUrl: assets.html_custom_report_upload,
        title: 'Upload Custom Reports',
        controller: 'CustomReportUploadController',
        controllerUrl: 'reporting/controllers/custom_report_upload_controller',
        css: assets.css_custom_reports
      }))

      .when('/reports/list', angularAMD.route({
        templateUrl: assets.html_collective_report_listing,
        title: 'Collective Insights',
        controller: 'CollectiveReportListingController',
        controllerUrl: 'reporting/collectiveReport/collective_report_listing_controller',
        css: assets.css_custom_reports
      }))

      .when('/reports/schedules', angularAMD.route({
        templateUrl: assets.html_reports_schedule_list,
        title: 'Scheduled Reports',
        controller: 'ReportsScheduleListController',
          controllerUrl: 'reporting/collectiveReport/reports_schedule_list_controller',
        css: assets.css_reports_schedule_list
      }))

      .when('/performance', angularAMD.route({
        templateUrl: assets.html_performance,
        title: 'Reports - Performance',
        controller: 'PerformanceController',
        controllerUrl: 'reporting/controllers/performance_controller'
      }))

      .when('/mediaplan/create', angularAMD.route({
        templateUrl: assets.html_campaign_create,
        title: 'Create - Media Plan',
        controller: 'CreateCampaignController',
        controllerUrl: '/scripts/workflow/controllers/campaign_create_controller',
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
      }))

      .when('/admin/accounts', angularAMD.route({
        templateUrl: assets.html_accounts,
        title: 'Accounts',
        controller: 'AccountsController',
        controllerUrl:'workflow/controllers/accounts_controller'
      }))

      .when('/admin/users', angularAMD.route({
        templateUrl: assets.html_users,
        title: 'Users',
        controller: 'UsersController',
        controllerUrl:'common/controllers/users/users_controller'
      }))

      .when('/mediaplan/:campaignId/edit', angularAMD.route({
        templateUrl: assets.html_campaign_create,
        title :  'Edit - Media Plan',
        controller: 'CreateCampaignController',
        controllerUrl: 'workflow/controllers/campaign_create_controller',
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
      }))

      .when('/mediaplan/:campaignId/overview', angularAMD.route({
        templateUrl: assets.html_campaign_create_ad,
        title: 'Media Plan - Overview',
        controller: 'CampaignOverViewController',
        controllerUrl: 'workflow/controllers/campaign_overview_controller',
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
      }))

      .when('/mediaplan/:campaignId/ads/create', angularAMD.route({
        templateUrl: assets.html_campaign_create_adBuild,
        title: 'Media Plan - Ad Create',
        controller: 'CampaignAdsCreateController',
        controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
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
      }))

      .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/create', angularAMD.route({
        templateUrl: assets.html_campaign_create_adBuild,
        title: 'Media Plan - Ad Create',
        controller: 'CampaignAdsCreateController',
        controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
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
      }))

      .when('/mediaplan/:campaignId/ads/:adId/edit', angularAMD.route({
        templateUrl: assets.html_campaign_create_adBuild,
        title :  'Media Plan - Ad Edit',
        controller: 'CampaignAdsCreateController',
        controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
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
      }))

      .when('/mediaplan/:campaignId/adGroup/:adGroupId/ads/:adId/edit', angularAMD.route({
        templateUrl: assets.html_campaign_create_adBuild,
        title :  'Media Plan - Ad Edit',
        controller: 'CampaignAdsCreateController',
        controllerUrl: 'workflow/controllers/campaign_adcreate_controller',
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
      }))

      .when('/creative/add', angularAMD.route({
        templateUrl: assets.html_creative,
        title: 'Add Creative',
        controller: 'CreativeController',
        controllerUrl: 'workflow/controllers/creative_controller',
        resolve: {
          'check': function ($location, RoleBasedService) {
            var isWorkflowUser =
              RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

            if (!isWorkflowUser) {
              $location.path('/');
            }
          }
        }
      }))

      .when('/creative/list', angularAMD.route({
        templateUrl: assets.html_creative_list,
        title: 'Creative List',
        controller: 'CreativeListController',
        controllerUrl: 'workflow/controllers/creative_list_controller',
        resolve: {
          'check': function ($location, RoleBasedService, workflowService, constants) {
            var isWorkflowUser =
              RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

            workflowService.setModuleInfo({
              'moduleName' : 'WORKFLOW',
              'warningMsg' : constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE ,
              'redirect' : false
            });

            if (!isWorkflowUser) {
              $location.path('/');
            }
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
  }).config(function(tagsInputConfigProvider) {
      tagsInputConfigProvider
          .setDefaults('tagsInput', {
              placeholder: 'New Label',
              minLength: 2,
              displayProperty: 'label',
              replaceSpacesWithDashes : false
          })

  })
    .run(function ($rootScope, $location, $cookies, loginModel, brandsModel, dataService, $cookieStore, workflowService) {
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
        });

      $rootScope.version = version;
      $rootScope.$on('$destroy', function () {
        locationChangeStartFunc();
        routeChangeSuccessFunc();
      });
    });

  return angularAMD.bootstrap(app);
});
