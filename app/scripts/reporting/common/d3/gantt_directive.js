define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('ganttChart', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_gantt_chart // jshint ignore:line
        };
    });
});
