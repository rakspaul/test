
var campaignListModule = angular.module('campaignListModule', ['commonModule','ui.multiselect'])

.config(function($routeProvider) {
    $routeProvider.when('/campaigns', {
      templateUrl: assets.html_campaign_list,
      controller: 'campaignListController',
    })
        $routeProvider.when('/campaigns/list', {
            templateUrl: assets.html_campaign_list,
            controller: 'campaignListController',
        })
  })

angular.module( 'ui.bootstrap.carousel' ,  [ 'ui.bootstrap.transition' ]) 
    .controller ( 'CarouselController' ,  [ '$scope' ,  '$timeout' ,  '$transition' ,  '$q' ,  function  ( $scope ,  $timeout ,  $transition ,  $q )  { 
    }]).directive ( 'carousel' ,  [ function ()  { 
        return  { 
        } 
}]);