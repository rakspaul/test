
var dashboardModule = angular.module('dashboardModule', ['timePeriodModule'])

  .config(function($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl: 'dashboard',
      controller: 'dashboardController'
    })
  })
