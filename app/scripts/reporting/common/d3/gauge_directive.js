define(['angularAMD', '../../controllers/gauge_controller'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('gauge', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_gauge, // jshint ignore:line
            link: function() {}
        };
    });
});
