var loginModule = angular.module('loginModule', ['commonModule'])

.config(function($routeProvider) {
	console.log('login module');
    $routeProvider.when('/login', {
      templateUrl: 'reports_login',
      controller: 'loginController'
    })
  })


