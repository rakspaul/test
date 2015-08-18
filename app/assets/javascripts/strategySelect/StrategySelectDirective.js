(function () {
    'use strict';
    strategySelectModule.directive('strategyDropDown', function(constants) {
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "="
            },
            controller: 'strategySelectController',
            templateUrl: assets.html_strategy_drop_down,
            link: function ($scope, element, attrs) {
                $scope.textConstants = constants;
                $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function() {
                    console.log("ON");
                    $scope.reset();// reset all data
                    $scope.isStrategyDropDownShow = true;
                    $scope.fetchStrategies();// fetch strategies and set selected Strategy as First Strategy
                });
            }
        }
    })
}());
