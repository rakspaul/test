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
      'lrInfiniteScroll']
  );


    angObj.config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/campaigns/:campaignId', {
                templateUrl: assets.html_campaign_details,
                title : 'Campaign Details',
                controller: 'CampaignDetailsController'
            })
            .when('/optimization', {
                templateUrl: assets.html_optimization,
                title :  'Reports - Optimization',
                controller: 'OptimizationController'
            })
            .when('/inventory', {
                templateUrl: assets.html_inventory ,
                title :  'Reports - Inventory',
                controller: 'InventoryController'
              
            })
            .when('/viewability', {
                templateUrl: assets.html_viewability,
                title :  'Reports - Viewability',
                controller: 'viewabilityController'
            })
            .when('/cost', {
                templateUrl: assets.html_cost,
                title :  'Reports - Cost',
                controller: 'costController'
            })
            .when('/platform', {
                templateUrl: assets.html_platform,
                title :  'Reports - Platform',
                controller: 'platformController'
            })
            .when('/performance', {
                templateUrl: assets.html_performance,
                title :  'Reports - Performance',
                controller: 'performanceController'
            })
            .otherwise({redirectTo: '/'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }).config([
        "$locationProvider", function($locationProvider) {
            return $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }).hashPrefix("!"); // enable the new HTML5 routing and history API
            // return $locationProvider.html5Mode(true).hashPrefix("!"); // enable the new HTML5 routing and history API
        }
    ]);

   angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService, $cookieStore, constants) {
        $rootScope.version = version;



        var handleLoginRedirection = function(isNetworkUser) {
            var cookieRedirect = $cookieStore.get(constants.COOKIE_REDIRECT) || null;

            if($cookieStore.get(constants.COOKIE_SESSION)) {
                var setDefaultPage;
                if(cookieRedirect) {
                    cookieRedirect = cookieRedirect.replace("/", '');
                }
                if(isNetworkUser && cookieRedirect && cookieRedirect !== 'dashboard')  {
                    $location.url(cookieRedirect);
                    $cookieStore.remove(constants.COOKIE_REDIRECT);
                } else {
                    setDefaultPage = isNetworkUser ? 'campaigns' : 'dashboard';
                    $location.url(setDefaultPage);
                }
            }
        }

        var loginCheckFunc = function() {
            var networkUser =  $cookieStore.get(constants.COOKIE_SESSION)  && $cookieStore.get(constants.COOKIE_SESSION).is_network_user;
            var isNetworkUser = (networkUser === 'true' || networkUser === true);
            var locationPath = $location.path();

            if(locationPath !== '/login') {
                brandsModel.enable();
            }
            dataService.updateRequestHeader();

            /**** if cookie is not set ***/
            if(!$cookieStore.get(constants.COOKIE_SESSION)) {
                $location.url('/login');
            }

            /* if some one try to change the authorization key or delete the key manually*/
            var authorizationKey  = localStorage.getItem('authorizationKey');// this is getting after successful login.
            if($cookieStore.get(constants.COOKIE_SESSION) && authorizationKey !== loginModel.getAuthToken()) {
                loginModel.unauthorized();
            }

            /* this function will execute when location path is either login or /,
             case- submit login button, cookie expire aur unauthorize */

            if (locationPath === '/login' || locationPath === '/') {
                handleLoginRedirection(isNetworkUser);
            }

            /*
             if some one manually try to change the url when logged in as network user
             will check from cookie if its a network user then will redirect to deafult page which in this is campaign;
             */

            if(isNetworkUser && locationPath === '/dashboard') {
                $location.url('campaigns');
            }
        }

        var locationChangeStartFunc  = $rootScope.$on('$locationChangeStart', function () {
            $rootScope.bodyclass='';
            loginCheckFunc();
        });

        var routeChangeSuccessFunc =  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            var locationPath = $location.path();
            $rootScope.bodyclass = '';
            var setPageTitle =  function() {
                var currentRoute = current.$$route;
                if(currentRoute) {
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
                    }
                    $rootScope.title = currentRoute.title;
                }
            }

            setPageTitle();
            if (loginModel.getLoginName()) {
                ga('set', 'dimension1', loginModel.getLoginName());

            }
        });

        $rootScope.$on('$destroy', function() {
            locationChangeStartFunc();
            routeChangeSuccessFunc();
        });


    });
}());
