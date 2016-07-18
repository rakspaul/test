define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('strategyDropDown', function(constants) {
        return {
            restrict: 'AE',

            scope: {
                selectedObj:'=',
                listColumns: '='
            },

            controller: 'StrategySelectController',
            templateUrl: assets.html_strategy_drop_down,

            link: function ($scope) {
                $scope.textConstants = constants;

                $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
                    // reset all data
                    $scope.reset();

                    $scope.isStrategyDropDownShow = true;

                    // fetch strategies and set selected Strategy as First Strategy
                    $scope.fetchStrategies();
                });
            }
        };
    });
});
