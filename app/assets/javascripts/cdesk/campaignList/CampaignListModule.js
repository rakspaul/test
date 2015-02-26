
var campaignListModule = angular.module('campaignListModule', ['commonModule','ui.multiselect'])

.config(function($routeProvider) {
    $routeProvider.when('/campaigns', {
      templateUrl: '/assets/html/orders/_campaign_list.html',
      controller: 'campaignListController'
    })
  })
