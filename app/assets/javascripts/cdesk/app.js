/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

  angObj = angular.module('cdeskApp',
    [ 'commonModule',
      'campaignListModule',
      'editActionsModule',
      'brandsModule',
      'timePeriodModule',
      'loginModule',
      'angulartics',
      'angulartics.google.analytics',
      'dashboardModule']
  );


    angObj.config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/campaigns/:campaignId', {
                templateUrl: 'campaign_details',
                controller: 'CampaignDetailsController'
            })
            .when('/optimization', {
              templateUrl: 'optimization',
              controller: 'OptimizationController'
            })
            .when('/inventory', {
              templateUrl: 'inventory' ,
              controller: 'InventoryController'
              
            })
            .when('/viewability', {
                templateUrl: 'viewability',
                controller: 'viewabilityController'
            })
            .when('/cost', {
                templateUrl: 'cost',
                controller: 'costController'
            })
            .when('/performance', {
                templateUrl: 'performance',
                controller: 'performanceController'
            })
            .otherwise({redirectTo: 'campaigns'});
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
