define(['angularAMD','common/services/constants_service'],function (angularAMD) {
  'use strict';
  angularAMD.directive("screenChart", function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_screen_chart,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    });
});
