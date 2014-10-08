(function () {
    'use strict';
    angObj.directive('campaignStrategyCard', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: 'campaign_strategy_card',

            link: function ($scope, element, attrs) { 
                //To show the accorsponding strategy card
                $scope.showStrategies = function(campaignId, strategiesCount) {
                    if(strategiesCount > 0) {
                      $('#strategies-accordion-' + campaignId).toggle();
                    }          
                };

                //This will call the Parent controllers loadMoreStrategies function
                $scope.loadMoreStrategies = function(campaignId) {
                    $scope.$parent.loadMoreStrategies(campaignId);         
                };

                //This is called when the user clicks on the campaign title
                $scope.goToLocation = function(url){
                    utils.goToLocation(url);
                };
            } 
        };
    });

}());