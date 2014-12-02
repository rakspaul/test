/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.

  var underscore = angular.module('underscore', []);
  underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });

  angObj = angular.module('cdeskApp',
    ['ngResource', //ngResource module when querying and posting data to a REST API.
      'ngRoute',      //ngRoute to enable URL routing to your application
      'ngCookies',
      'highcharts-ng',
      'infinite-scroll',
      'underscore']
  );


    angObj.config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/campaigns', {
                templateUrl: 'campaign_list',
                controller: 'CampaignsController'
            })
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
            .when('/reports_performance', {
                templateUrl: 'reports_performance'
            })
            .otherwise({redirectTo: 'campaigns'});
     //   $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
    //new campaigns api
    angObj.constant('campaign_api', '');
    angObj.constant('api', scala_api);

    var urlPaths = {
        apiSerivicesUrl: scala_api
    };
    angObj.constant('apiPaths', urlPaths);

    var colorArray = ["#7ED86C", "#2C417F", "#FF9F19", "#A750E5", "#6C717F", "#3F7F57", "#7F4F2C", "#3687D8", "#B235B2"];
    angObj.constant('actionColors',colorArray);

    /*
     * Used for UI related text changes
     * */
    angObj.constant('common', {
        title: 'Collective Desk',
        selectTab:$("ul.nav:first").find('.active').removeClass('active').end(),
//        useTempData:'tempdata' //null for actual api endpoint
        useTempData: null
    });

    angObj.run(function ($rootScope, $location, $cookies) {

        $rootScope.$on('$locationChangeStart', function () {
            if (($cookies.token === undefined) && ($location.path() !== '/login')) {
             //   $location.url('/login');
            }
        });
    });
}());
