(function () {
    'use strict';
    kpiSelectModule.directive('kpiDropDown', function () {
        return {
            restrict:'EAC',
            controller: 'kpiSelectController',
            scope: {type : '='},
            templateUrl: assets.html_kpi_drop_down,
            link: function(scope, element, attrs) {
                scope.$watch('type', function(newValue, oldValue) {
                    if(newValue !== oldValue) {
                        scope.setSelectedKpi(newValue)//selected_filters.kpi_type = newValue;
                    }
                })
            }
        };
    });

}());
