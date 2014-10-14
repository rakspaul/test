/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.
    angObj = angular.module('cdeskApp', [
        'ngResource', //ngResource module when querying and posting data to a REST API.
        'ngRoute',      //ngRoute to enable URL routing to your application
        'ngCookies',
        'highcharts-ng',
        'infinite-scroll'
    ]);

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
            .otherwise({redirectTo: 'campaigns'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });

    angObj.constant('campaign_api', '');
    angObj.constant('api', 'http://dev-desk.collective-media.net:5000');

    var urlPaths = {
        campaignDetails: 'http://dev-desk.collective-media.net:4000', 
        actionDetails: 'http://dev-desk.collective-media.net:9000'
    };
    angObj.constant('apiPaths', urlPaths);

    var colorArray = ["#7ED86C", "#2C417F", "#FF9F19", "#A750E5", "#6C717F", "#3F7F57", "#7F4F2C", "#3687D8", "#B235B2"];
    angObj.constant('actionColors',colorArray);

    /*
     * Used for UI related text changes
     * */
    angObj.constant('common', {
        title: 'Collective Desk',
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
