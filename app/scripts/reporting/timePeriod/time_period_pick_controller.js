define(['angularAMD', 'reporting/timePeriod/time_period_model', 'common/services/constants_service'
], function (angularAMD) {
    'use strict';
    angularAMD.controller('TimePeriodPickController', function ($scope, $rootScope, timePeriodModel, constants) {

        $scope.timeData = timePeriodModel.timeData;

        $scope.datePickerfilterByTimePeriod = function (key, timePeriod, timePeriods) {
            key.key = "custom&start_date=" + timePeriod + "&end_date=" + timePeriods;
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
        if (datesFromLocStore || endDatesFromLocStore) {
            datesFromLocStore = JSON.parse(localStorage.getItem('customStartDate'));
            endDatesFromLocStore = JSON.parse(localStorage.getItem('customEndDate'));
            $scope.reports.schedule.startDate = datesFromLocStore;
            $scope.reports.schedule.endDate = endDatesFromLocStore;
        }
        else {
            $scope.reports.schedule.startDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
            $scope.reports.schedule.endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
        }

        if (timePeriodModel.timeData.displayTimePeriod === "Custom") {
            $("#newDatePickerBox").show();
        }
        else {
            $("#newDatePickerBox").hide();
        }

        $(document).ready(function () {
            $("#endDateInput,#startDateInput").keydown(function () {
                return false;
            });

            $('.input-daterange').datepicker({
                //format: "dd-mm-yyyy",
                format: "yyyy-mm-dd",
                orientation: "auto",
                autoclose: true,
                todayHighlight: true,
                keyboardNavigation: false,
                endDate: '+0d'
            });

            $('#startDateInput').datepicker('setEndDate', moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT));
            $('#startDateInput').datepicker('update', moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT));
            $('#endDateInput').datepicker('update', moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT));

        });


    });
});
