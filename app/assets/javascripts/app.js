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
       var setDefaultPage = 'campaigns';
       if(localStorage.getItem('networkUser') == 'true' || localStorage.getItem('networkUser') == true){
        setDefaultPage = 'campaigns';
       }else{
        setDefaultPage = 'dashboard';
       }
        $routeProvider
            .when('/campaigns/:campaignId', {
                templateUrl: assets.html_campaign_details,
                controller: 'CampaignDetailsController'
            })
            .when('/optimization', {
              templateUrl: assets.html_optimization,
              controller: 'OptimizationController'
            })
            .when('/inventory', {
              templateUrl: assets.html_inventory ,
              controller: 'InventoryController'
              
            })
            .when('/viewability', {
                templateUrl: assets.html_viewability,
                controller: 'viewabilityController'
            })
            .when('/cost', {
                templateUrl: assets.html_cost,
                controller: 'costController'
            })
            .when('/performance', {
                templateUrl: assets.html_performance,
                controller: 'performanceController'
            })
            .otherwise({redirectTo: setDefaultPage});
     //   $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
    });

    angObj.run(function ($rootScope, $location, $cookies, loginModel, loginService, brandsModel, dataService, $cookieStore, constants) {
        //$rootScope.bodyclass=''; 
        $rootScope.$on('$locationChangeStart', function () {
          $rootScope.bodyclass=''; 
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
            
            if($location.path() == '/dashboard'){
               $rootScope.bodyclass='dashboard_body';
            }else{
                $rootScope.bodyclass='';
            }
        });

      if($cookieStore.get(constants.COOKIE_REDIRECT) && $cookieStore.get(constants.COOKIE_SESSION)) {
        $location.url($cookieStore.get(constants.COOKIE_REDIRECT));
        $cookieStore.remove(constants.COOKIE_REDIRECT);
      }
    });
}());
