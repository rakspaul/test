define(['angularAMD', 'kpi-select-controller'], function (angularAMD) {
    'use strict';

    angularAMD.directive('kpiDropDown', ['constants', function (constants) {
        return {
            restrict:'EAC',
            controller: 'KpiSelectController',

            scope: {
                type: '=',
                changedrpval :'='
            },

            templateUrl: assets.html_kpi_drop_down,

            link: function (scope, element, attrs) {
                scope.textConstants = constants;
                scope.whichCaller = attrs;

                scope.$watch('type', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scope.setSelectedKpi(newValue);
                    }
                });
            }
        };
    }]);
});
