var loginModule = angular.module('loginModule', ['commonModule'])

.config(function($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'reports_login',
      controller: 'loginController'
    }).otherwise({redirectTo: 'campaigns'});
  })


