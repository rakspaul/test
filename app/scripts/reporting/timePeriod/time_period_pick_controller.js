define(['angularAMD', 'time-period-model'], function (angularAMD) {
    'use strict';
    angularAMD.controller('TimePeriodPickController', ['$scope', '$rootScope', 'timePeriodModel', 'constants',

        function ($scope, $rootScope, timePeriodModel, constants) {

        $scope.reports = {};
        $scope.reports.reportDefinition = {};
        $scope.reports.schedule = {};

        $scope.timeData = timePeriodModel.timeData;

        $scope.reports.schedule.startDate = moment()
            .subtract(0, 'days').
            format(constants.DATE_UTC_SHORT_FORMAT);

        $scope.reports.schedule.endDate = moment()
            .subtract(0, 'days')
            .format(constants.DATE_UTC_SHORT_FORMAT);

        if (timePeriodModel.timeData.displayTimePeriod === 'Custom') {
            $('#newDatePickerBox').show();
        } else {
            $('#newDatePickerBox').hide();
        }

        $scope.datePickerfilterByTimePeriod = function (key, startDate, endDate) {
            key.key = 'custom&start_date=' + startDate + '&end_date=' + endDate;
            timePeriodModel.selectTimePeriod(key);
            $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
            timePeriodModel.setTimeFilterCustomDates({startDate : startDate, endDate : endDate});
        };

        $(document).ready(function () {
            var startDateInput = $('#startDateInput');

            $('#endDateInput, #startDateInput').keydown(function () {
                return false;
            });

            $('.input-daterange').datepicker({
                format: 'yyyy-mm-dd',
                orientation: 'auto',
                autoclose: true,
                todayHighlight: true,
                keyboardNavigation: false,
                endDate: '+0d'
            });

            startDateInput.datepicker(
                'setEndDate',
                moment()
                    .subtract(0, 'days').
                    format(constants.DATE_UTC_SHORT_FORMAT)
            );

            startDateInput.datepicker(
                'update',
                moment()
                    .subtract(0, 'days')
                    .format(constants.DATE_UTC_SHORT_FORMAT)
            );

            $('#endDateInput').datepicker(
                'update',
                moment()
                    .subtract(0, 'days')
                    .format(constants.DATE_UTC_SHORT_FORMAT)
            );
        });
    }]);
});
