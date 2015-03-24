
var dashboardModule = angular.module('dashboardModule', ['timePeriodModule'])

  .config(function($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl: assets.html_dashboard,
      controller: 'dashboardController'
    })
  })
