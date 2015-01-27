(function() {
    "use strict";
    commonModule.service("bubbleChart", function() {
        this.createBubbleChart = function() {

        };
    })
}());

(function() {
    "use strict";
    commonModule.directive("bubbleChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: 'bubble_chart'
        }
    })
}());