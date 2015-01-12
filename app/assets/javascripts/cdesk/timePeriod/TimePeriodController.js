(function () {
  'use strict';
  timePeriodModule.controller('timePeriodController', function ($scope, timePeriodModel, constants, $rootScope) {

    $scope.timeData = timePeriodModel.timeData;

    $scope.filterByTimePeriod = function(timePeriod) {
      timePeriodModel.selectTimePeriod(timePeriod)
      $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
    }

    $scope.timePeriodClicked = function() {
      $("#cdbDropdown").toggle();
      $("#brandsList").closest(".each_filter").removeClass("dropdown_open");
      $("#cdbMenu").closest(".each_filter").toggleClass("dropdown_open");
      $("#brandsList").hide();
      $("#profileDropdown").hide();
    }

  });
}());
