(function () {
    'use strict';
    kpiSelectModule.directive('kpiDropDown', function () {
        return {
            restrict:'EAC',
            controller: 'kpiSelectController',
            scope: {
            },
            templateUrl: assets.html_kpi_drop_down
        };
    });

}());
