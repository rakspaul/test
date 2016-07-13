define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('timeperiodDropDown', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_timeperiod_drop_down // jshint ignore:line
        };
    });
});
