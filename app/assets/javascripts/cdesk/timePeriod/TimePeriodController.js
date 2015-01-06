(function () {
  'use strict';
  timePeriodModule.controller('timePeriodController', function ($scope, timePeriodModel, constants, $rootScope) {

    $scope.timeData = timePeriodModel.timeData;

    $scope.filterByTimePeriod = function(timePeriod) {
      timePeriodModel.selectTimePeriod(timePeriod)
      $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
    }

  });
}());
