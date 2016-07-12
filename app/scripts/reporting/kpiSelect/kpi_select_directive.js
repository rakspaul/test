define(['angularAMD', 'common/services/constants_service', // jshint ignore:line
    'reporting/kpiSelect/kpi_select_controller'], function (angularAMD) {
    'use strict';

    angularAMD.directive('kpiDropDown', function (constants) {
        return {
            restrict:'EAC',
            controller: 'KpiSelectController',

            scope: {
                type : '=',
                changedrpval :'='
            },

            templateUrl: assets.html_kpi_drop_down, // jshint ignore:line

            link: function(scope, element, attrs) {
                scope.textConstants = constants;
                scope.whichCaller = attrs;
                scope.$watch('type', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scope.setSelectedKpi(newValue);
                    }
                });
            }
        };
    });
});
