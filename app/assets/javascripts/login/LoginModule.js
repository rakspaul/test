var loginModule = angular.module('loginModule', ['commonModule'])

.config(function($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: assets.html_reports_login,
      controller: 'loginController'
    }).otherwise({redirectTo: 'campaigns'});
  })


