define(['angularAMD', '../../../common/services/constants_service'], function (angularAMD) { // jshint ignore:line
    angularAMD.directive('bubbleChart', function (constants) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_bubble_chart, // jshint ignore:line

            link: function($scope) {
                $scope.textConstants = constants;
            }
        };
    });
});
