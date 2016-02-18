(function () {
    'use strict';
    timePeriodModule.controller('TimePeriodPickController', function ($scope, timePeriodModel, constants, $rootScope) {

        $scope.timeData = timePeriodModel.timeData;

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

        $(document).ready(function() {
        $('.input-daterange').datepicker({
            //format: "dd-mm-yyyy",
            format: "yyyy-mm-dd",
            orientation: "top right",
            autoclose: true,
            todayHighlight: true,
            keyboardNavigation: false,
            endDate: '+0d'
         });
        });

        $('#newDatePickerBox').click(
            function(e){
                var deliverOn = $("#deliverOn").val(),
                    startDate = $("#startDateInput").val(),
                    endDate = $("#endDateInput").val();
                $('#startDateInput').datepicker('update', startDate);
                //$('#startDateInputGlyph').datepicker('update', startDate);
                $("#endDateInput, #endDateInputGlyph").datepicker('update', endDate);
                //$('#endDateInputGlyph').datepicker('update', endDate);
            }
        );
    });
}());
