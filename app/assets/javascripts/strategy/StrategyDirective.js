(function () {
    'use strict';
    strategyModule.directive('strategyDropDown', function() {
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "="
            },
            controller: 'strategyController',
            templateUrl: '/assets/html/strategy_drop_down.html'
        }
    })
}());
