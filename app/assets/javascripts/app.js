/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

  angObj = angular.module('app',
    [ 'commonModule',
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
        var networkUser =  localStorage.getItem('networkUser');
        var setDefaultPage = (networkUser === 'true' || networkUser === true) ? 'campaigns' : 'dashboard';
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
            .when('/performance', {
                templateUrl: assets.html_performance,
                title :  'Reports - Performance',
                controller: 'performanceController'
            })
            .otherwise({redirectTo: setDefaultPage});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });

    angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService, $cookieStore, constants) {
        $rootScope.version = version;
        var locationChangeStartFunc  = $rootScope.$on('$locationChangeStart', function () {
            $rootScope.bodyclass='';
            var locationPath = $location.path();
            if(locationPath !== '/login') {
                brandsModel.enable();
            }
            dataService.updateRequestHeader();

            //if logged in - go to campaigns
            if (($cookies.cdesk_session) && (locationPath === '/login')) {
                $location.url('campaigns');
            }
            if (($cookies.cdesk_session === undefined) && (locationPath !== '/login')) {
                $cookieStore.put(constants.COOKIE_REDIRECT, locationPath);
                $location.url('login');
            }
        });

        var routeChangeSuccessFunc =  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            var locationPath = $location.path();
            if (loginModel.getLoginName()) {
                ga('set', 'dimension1', loginModel.getLoginName());
            }

            if (locationPath == '/dashboard') {
                current.$$route.title = 'Dashboard'
                $rootScope.bodyclass = 'dashboard_body';
            } else {
                $rootScope.bodyclass = '';
            }

            if ($location.path() == '/campaigns'){
                current.$$route.title = 'Campaign List';
            }

            if($location.path() == '/login'){
                current.$$route.title = 'Login'
            }

            if (current.hasOwnProperty('$$route')) {
                $rootScope.title = current.$$route.title;
            }
        });

        $rootScope.$on('$destroy', function() {
            locationChangeStartFunc();
            routeChangeSuccessFunc();
        });

        if($cookieStore.get(constants.COOKIE_REDIRECT) && $cookieStore.get(constants.COOKIE_SESSION)) {
            $location.url($cookieStore.get(constants.COOKIE_REDIRECT));
            $cookieStore.remove(constants.COOKIE_REDIRECT);
        }
    });
}());
