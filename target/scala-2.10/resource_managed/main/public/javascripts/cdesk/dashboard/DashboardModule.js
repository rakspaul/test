
var dashboardModule = angular.module('dashboardModule', ['timePeriodModule'])

  .config(function($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl: '/assets/html/dashboard.html',
      controller: 'dashboardController'
    })
  })
