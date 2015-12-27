(function () {
  'use strict';
  timePeriodModule.controller('TimePeriodController', function ($scope, timePeriodModel, constants, $rootScope, loginModel, analytics) {

    $scope.timeData = timePeriodModel.timeData;

    $scope.filterByTimePeriod = function(timePeriod) {
      timePeriodModel.selectTimePeriod(timePeriod);
      //$rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
      analytics.track(loginModel.getUserRole(), constants.GA_TIME_PERIOD_SELECTED, timePeriod.display, loginModel.getLoginName());
    };

    $scope.timePeriodClicked = function() {
      $("#cdbDropdown").toggle();
      $("#brandsList").closest(".each_filter").removeClass("filter_dropdown_open");
      $("#cdbMenu").closest(".each_filter").toggleClass("filter_dropdown_open");
      $("#brandsList").hide();
      $("#profileDropdown").hide();
        $('#cdbDropdown').click(
            function(e){
                var clickedDateRange = e.target.id;
                var clickedDateText = $(e.target).text();
                $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED, clickedDateRange);
                localStorage.setItem('timeSetLocStore', JSON.stringify(clickedDateRange));
                localStorage.setItem('timeSetTextLocStore', JSON.stringify(clickedDateText));
                e.stopImmediatePropagation();

            }
        );
    }





  });
}());
