
var campaignListModule = angular.module('campaignListModule', ['commonModule','ui.multiselect'])

.config(function($routeProvider) {
    $routeProvider.when('/campaigns', {
      templateUrl: '/assets/html/campaign_list.html',
      controller: 'campaignListController'
    })
  })
