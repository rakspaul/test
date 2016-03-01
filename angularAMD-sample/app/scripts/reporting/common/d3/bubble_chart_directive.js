define(['angularAMD','common/services/constants_service'], function (angularAMD) {
    angularAMD.directive("bubbleChart", function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_bubble_chart,
            link: function($scope, iElm, iAttrs, controller) {
                $scope.textConstants = constants;
            }
        };
    });
});

