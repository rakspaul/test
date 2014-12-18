
var campaignListModule = angular.module('campaignListModule', ['commonModule'])

.config(function($routeProvider) {
    $routeProvider.when('/campaigns', {
      templateUrl: 'campaign_list',
      controller: 'campaignListController'
    })
  })
