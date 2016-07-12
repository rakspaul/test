define(['angularAMD','common/services/constants_service','reporting/kpiSelect/kpi_select_controller'],function (angularAMD) {

    'use strict';
    angularAMD.directive('kpiDropDown', function (constants) {
        return {
            restrict:'EAC',
            controller: 'KpiSelectController',
            scope: {type : '=',
                changedrpval :'='
            },
            templateUrl: assets.html_kpi_drop_down,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
                scope.whichCaller = attrs;
                scope.$watch('type', function(newValue, oldValue) {
                    if(newValue !== oldValue) {
                        scope.setSelectedKpi(newValue)//selectedFilters.kpi_type = newValue;
                    }
                })
            }
        };
    });

});
