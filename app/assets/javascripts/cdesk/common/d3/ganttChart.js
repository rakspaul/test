(function() {
    "use strict";
    commonModule.service("ganttChart", function() {
        this.createGanttChart = function() {

        };
    })
}());

(function() {
    "use strict";
    commonModule.directive("ganttChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: 'gantt_chart'
        }
    })
}());