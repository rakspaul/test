
var campaignListModule = angular.module('campaignListModule', ['commonModule','ui.multiselect'])

.config(function($routeProvider) {
    $routeProvider.when('/campaigns', {
      templateUrl: 'campaign_list',
      controller: 'campaignListController'
    })
  })
