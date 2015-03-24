(function () {
    'use strict';
    kpiSelectModule.directive('kpiDropDown', function () {
        return {
            restrict:'EAC',
            controller: 'kpiSelectController',
            scope: {
                selectedObj : '='
            },
            templateUrl: assets.html_kpi_drop_down
        };
    });

}());
