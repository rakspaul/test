define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('screenChart', ['constants', function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_screen_chart,

            link: function(scope) {
                scope.textConstants = constants;
            }
        };
    }]);
});
