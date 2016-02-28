define(['angularAMD'],function (angularAMD) {
  'use strict';
  angularAMD.directive("gaugeDirective", function () {
    return {
      restrict: 'EAC',
      templateUrl: assets.html_gauge,
      link:function(scope, element) {
      }
    }
  })
});
