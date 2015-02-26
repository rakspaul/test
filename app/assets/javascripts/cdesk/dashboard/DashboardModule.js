
var dashboardModule = angular.module('dashboardModule', ['timePeriodModule'])

  .config(function($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl: '/assets/html/orders/_dashboard.html',
      controller: 'dashboardController'
    })
  })
