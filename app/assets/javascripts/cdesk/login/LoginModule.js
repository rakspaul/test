var loginModule = angular.module('loginModule', ['commonModule'])

.config(function($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: '/assets/html/reports_login.html',
      controller: 'loginController'
    }).otherwise({redirectTo: 'campaigns'});
  })


