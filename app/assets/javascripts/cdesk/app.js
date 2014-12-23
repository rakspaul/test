/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

  angObj = angular.module('cdeskApp',
    [ 'commonModule',
      'campaignListModule']
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

    angObj.run(function ($rootScope, $location, $cookies) {

        $rootScope.$on('$locationChangeStart', function () {
            if (($cookies.token === undefined) && ($location.path() !== '/login')) {
             //   $location.url('/login');
            }
        });
    });
}());
