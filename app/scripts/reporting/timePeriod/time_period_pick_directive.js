define(['angularAMD', 'reporting/timePeriod/time_period_directive'], function (angularAMD) {
    'use strict';
    angularAMD.directive('timeperiodDropDownPicker', function () {
        return {
            restrict: 'EAC',
            controller: 'TimePeriodPickController',
            templateUrl: assets.html_timeperiod_drop_down_picker
        };
    });
});
