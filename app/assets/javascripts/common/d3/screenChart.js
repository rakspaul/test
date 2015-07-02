(function () {
    "use strict";
    commonModule.directive("screenChart", function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_screen_chart,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        }
    })
}());
