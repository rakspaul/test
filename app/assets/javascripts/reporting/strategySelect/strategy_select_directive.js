(function () {
    'use strict';
    strategySelectModule.directive('strategyDropDown', function(constants) {
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "="
            },
            controller: 'StrategySelectController',
            templateUrl: assets.html_strategy_drop_down,
            link: function ($scope, element, attrs) {
                $scope.textConstants = constants;
            }
        }
    })
}());
