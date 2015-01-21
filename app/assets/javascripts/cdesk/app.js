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

    angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel) {

        $rootScope.$on('$locationChangeStart', function () {
            brandsModel.enable();
            if (($cookies.cdesk_session === undefined) && ($location.path() !== '/login')) {
                $location.url('login');
            }

            if((!loginModel.getUserId()) && ($location.path() !== '/login')){
              //get userinfo from token
              loginService.getUserInfo($cookies.auth_token);
            }
            
            //if logged in - go to campaigns
            if (($cookies.cdesk_session) && ($location.path() === '/login')) {
                $location.url('campaigns');
            }
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            if(loginModel.getLoginName()) {
                ga('set', 'dimension1', loginModel.getLoginName());
            }
        });
    });
}());
