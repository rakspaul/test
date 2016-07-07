define(['angularAMD', '../../../common/services/constants_service'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('screenChart', function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_screen_chart, // jshint ignore:line

            link: function(scope) {
                scope.textConstants = constants;
            }
        };
    });
});
