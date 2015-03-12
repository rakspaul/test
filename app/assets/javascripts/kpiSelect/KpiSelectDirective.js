(function () {
    'use strict';
    angObj.directive('kpiDropDown', function () {
        return {
            restrict:'EAC',
            controller: 'kpiSelectController',
            scope: {
                selectedObj : '='
            },
            templateUrl: '/assets/html/kpi_drop_down.html'
        };
    });

}());
