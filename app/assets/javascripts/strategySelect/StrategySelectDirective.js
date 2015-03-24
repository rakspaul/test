(function () {
    'use strict';
    strategySelectModule.directive('strategyDropDown', function() {
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "="
            },
            controller: 'strategySelectController',
            templateUrl: assets.html_strategy_drop_down
        }
    })
}());
