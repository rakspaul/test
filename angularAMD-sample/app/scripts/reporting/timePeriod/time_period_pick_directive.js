define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive('timeperiodDropDownPicker', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_timeperiod_drop_down_picker
        };
    });

});
