define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('bubbleChart', ['constants', function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_bubble_chart,

            link: function($scope) {
                $scope.textConstants = constants;
            }
        };
    }]);
});
