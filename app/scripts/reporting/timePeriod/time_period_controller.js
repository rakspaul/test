define(['angularAMD', 'reporting/timePeriod/time_period_model', // jshint ignore:line
    'common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('TimePeriodController', function ($scope, $rootScope, timePeriodModel, constants) {
        $scope.timeData = timePeriodModel.timeData;

        $scope.filterByTimePeriod = function (timePeriod) {
            timePeriodModel.selectTimePeriod(timePeriod);

            if (!timePeriod.key.startsWith('custom')) {
                $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
            }
        };

        $scope.timePeriodClicked = function () {
            var startDateInput = $('#startDateInput'),
                endDateInput = $('#endDateInput'),
                startDate = startDateInput.val(),
                endDate = endDateInput.val(),
                cdbDropdown = $('#cdbDropdown'),
                brandsList = $('#brandsList');

            startDateInput.datepicker('update', startDate);
            $('#startDateInputGlyph').datepicker('update', startDate);
            endDateInput.datepicker('update', endDate);
            $('#endDateInputGlyph').datepicker('update', endDate);

            cdbDropdown.toggle();
            brandsList.closest('.each_filter').removeClass('filter_dropdown_open');
            $('#cdbMenu').closest('.each_filter').toggleClass('filter_dropdown_open');
            brandsList.hide();
            $('#profileDropdown').hide();

            cdbDropdown.click(
                function (e) {
                    var clickedDateRange = e.target.id,
                        clickedDateText = $(e.target).text();

                    if (clickedDateRange.startsWith('custom')) {
                        $('#newDatePickerBox').show();
                        $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED, clickedDateRange);
                    } else {
                        $('#newDatePickerBox').hide();
                    }

                    localStorage.setItem('timeSetLocStore', JSON.stringify(clickedDateRange));
                    localStorage.setItem('timeSetTextLocStore', JSON.stringify(clickedDateText));

                    e.stopImmediatePropagation();
                }
            );
        };
    });
});