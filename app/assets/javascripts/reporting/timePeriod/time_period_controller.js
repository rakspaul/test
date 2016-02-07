(function () {
  'use strict';
  timePeriodModule.controller('TimePeriodController', function ($scope, timePeriodModel, constants, $rootScope, loginModel, analytics) {

    $scope.timeData = timePeriodModel.timeData;

    $scope.filterByTimePeriod = function(timePeriod) {
        timePeriodModel.selectTimePeriod(timePeriod);
        if(!timePeriod.key.startsWith("custom")){
            $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
        }
      analytics.track(loginModel.getUserRole(), constants.GA_TIME_PERIOD_SELECTED, timePeriod.display, loginModel.getLoginName());
    };

    $scope.datePickerfilterByTimePeriod = function(key,timePeriod,timePeriods) {
          key.key ="custom&start_date="+timePeriods+"&end_date="+timePeriod;
          timePeriodModel.selectTimePeriod(key);
          $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED, key);
          localStorage.setItem('customStartDate', JSON.stringify(timePeriod));
          localStorage.setItem('customEndDate', JSON.stringify(timePeriods));
    };

      $scope.reports = {};
      $scope.reports.reportDefinition = {};
      $scope.reports.schedule = {};


      // first check in local storage here
      var datesFromLocStore = localStorage.getItem('customStartDate');
      var endDatesFromLocStore = localStorage.getItem('customEndDate');
      if(datesFromLocStore || endDatesFromLocStore) {
          datesFromLocStore = JSON.parse(localStorage.getItem('customStartDate'));
          endDatesFromLocStore = JSON.parse(localStorage.getItem('customEndDate'));
          $scope.reports.schedule.startDate =  endDatesFromLocStore;
          $scope.reports.schedule.endDate = datesFromLocStore;
      }
      else {
          $scope.reports.schedule.startDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
          $scope.reports.schedule.endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
      }


      if(timePeriodModel.timeData.displayTimePeriod === "Custom"){
          $("#newDatePickerBox").show();
      }
      else{
          $("#newDatePickerBox").hide();
      }

      $('#newDatePickerBox').click(
          function(e){
              var deliverOn = $("#deliverOn").val(),
                  startDate = $("#startDateInput").val(),
                  endDate = $("#endDateInput").val();
              $('#startDateInput').datepicker('update', startDate);
              $('#startDateInputGlyph').datepicker('update', startDate);
              $('#endDateInput').datepicker('update', endDate);
              $('#endDateInputGlyph').datepicker('update', endDate);
          }
      );

    $scope.timePeriodClicked = function() {
        var deliverOn = $("#deliverOn").val(),
            startDate = $("#startDateInput").val(),
            endDate = $("#endDateInput").val();
        $('#startDateInput').datepicker('update', startDate);
        $('#startDateInputGlyph').datepicker('update', startDate);
        $('#endDateInput').datepicker('update', endDate);
        $('#endDateInputGlyph').datepicker('update', endDate);

      $("#cdbDropdown").toggle();
      $("#brandsList").closest(".each_filter").removeClass("filter_dropdown_open");
      $("#cdbMenu").closest(".each_filter").toggleClass("filter_dropdown_open");
      $("#brandsList").hide();
      $("#profileDropdown").hide();
        $('#cdbDropdown').click(
            function(e){
                var clickedDateRange = e.target.id;
                var clickedDateText = $(e.target).text();
                    if(clickedDateRange.startsWith("custom")){
                    $("#newDatePickerBox").show();
                }
                else{
                    $("#newDatePickerBox").hide();
                    $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED, clickedDateRange);
                }
                localStorage.setItem('timeSetLocStore', JSON.stringify(clickedDateRange));
                localStorage.setItem('timeSetTextLocStore', JSON.stringify(clickedDateText));
                e.stopImmediatePropagation();

            }
        );
    }
  });
}());
