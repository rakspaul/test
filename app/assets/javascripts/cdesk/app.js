/*global angular, api*/
var angObj = '';
(function () {
    'use strict'; //This strict context prevents certain actions from being taken and throws more exceptions.
    angObj = angular.module('cdeskApp', [
        'ngResource', //ngResource module when querying and posting data to a REST API.
        'ngRoute',      //ngRoute to enable URL routing to your application
        'ngCookies',
        'highcharts-ng'
    ]);

    angObj.config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/campaigns', {
                templateUrl: 'assets/campaign_list.html',
                controller: 'campaignController'
            })
            .otherwise({redirectTo: 'campaigns'});
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });

    angObj.constant('campaign_api', '');
    angObj.constant('api', 'http://dev-desk.collective-media.net:5000');

    /*
     * Used for UI related text changes
     * */
    angObj.constant('common', {
        title: 'Multi screen Audience Dashboard',
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