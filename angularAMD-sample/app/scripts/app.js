define(['common'], function (angularAMD) {
  'use strict';
  var app = angular.module('vistoApp', ['ngRoute', 'ngCookies','tmh.dynamicLocale','ui.bootstrap', 'door3.css','ngFileUpload', 'ngSanitize']);
  app.config(function ($routeProvider, $httpProvider) {

    $routeProvider.when('/login', angularAMD.route({
      templateUrl: assets.html_reports_login,
      title: 'Login',
      controller: 'loginController',
      controllerUrl: 'login/login_controller'
    })).otherwise({redirectTo: '/'});

  }).config([
    '$locationProvider', function ($locationProvider) {
      return $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      }).hashPrefix('!');
      // enable the new HTML5 routing and history API
      // return $locationProvider.html5Mode(true).hashPrefix('!');
    }
  ]).config(function (tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('libs/angular-locale_{{locale}}.js');
  })

  return angularAMD.bootstrap(app);
});
