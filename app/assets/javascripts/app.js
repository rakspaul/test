/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

  angObj = angular.module('app',
    [ 'commonModule',
      'campaignListModule',
      'editActionsModule',
      'brandsModule',
      'timePeriodModule',
      'loginModule',
      'angulartics',
      'angulartics.google.analytics',
      'dashboardModule',
      'ngSanitize',
      'ui.bootstrap']
  );


    angObj.config(function ($routeProvider, $httpProvider) {
       var setDefaultPage = 'campaigns';
       if(localStorage.getItem('networkUser') == 'true' || localStorage.getItem('networkUser') == true){
        setDefaultPage = 'campaigns';
       }else{
        setDefaultPage = 'dashboard';
       }
        $routeProvider
            .when('/campaigns/:campaignId', {
                templateUrl: '/assets/html/campaign_details.html',
                controller: 'CampaignDetailsController'
            })
            .when('/optimization', {
              templateUrl: '/assets/html/optimization.html',
              controller: 'OptimizationController'
            })
            .when('/inventory', {
              templateUrl: '/assets/html/inventory.html' ,
              controller: 'InventoryController'
              
            })
            .when('/viewability', {
                templateUrl: '/assets/html/viewability.html',
                controller: 'viewabilityController'
            })
            .when('/cost', {
                templateUrl: '/assets/html/cost.html',
                controller: 'costController'
            })
            .when('/performance', {
                templateUrl: '/assets/html/performance.html',
                controller: 'performanceController'
            })
            .otherwise({redirectTo: setDefaultPage});
     //   $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
    });

    angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService, $cookieStore, constants) {

        $rootScope.$on('$locationChangeStart', function () {
          if($location.path() !== '/login') {
            brandsModel.enable();
          }
            dataService.updateRequestHeader();

            //if logged in - go to campaigns
          if (($cookies.cdesk_session) && ($location.path() === '/login')) {
              $location.url('campaigns');
          }
          if (($cookies.cdesk_session === undefined) && ($location.path() !== '/login')) {
            $cookieStore.put(constants.COOKIE_REDIRECT, $location.path());
            $location.url('login');
          }
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            if(loginModel.getLoginName()) {
                ga('set', 'dimension1', loginModel.getLoginName());
            }
        });

      if($cookieStore.get(constants.COOKIE_REDIRECT) && $cookieStore.get(constants.COOKIE_SESSION)) {
        $location.url($cookieStore.get(constants.COOKIE_REDIRECT));
        $cookieStore.remove(constants.COOKIE_REDIRECT);
      }
    });
}());
