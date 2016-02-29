define(['angularAMD'],function (angularAMD) {
  'use strict';
  angularAMD.directive("ganttChart", function() {
    return {
      restrict: 'EAC',
      templateUrl: assets.html_gantt_chart
    }
  });
});
