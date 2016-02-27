define(['angularAMD'],function (angularAMD) {
  'use strict';
  angularAMD.directive('timeperiodDropDown', function () {
    return {
      restrict: 'EAC',
      templateUrl: assets.html_timeperiod_drop_down
    };
  });
});
