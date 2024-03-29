define(['angularAMD', 'time-period-model'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('TimePeriodController', ['$scope', '$rootScope', 'timePeriodModel', 'constants',
        function ($scope, $rootScope, timePeriodModel, constants) {

        $scope.timeData = timePeriodModel.timeData;

        $scope.filterByTimePeriod = function (timePeriod) {
            timePeriodModel.selectTimePeriod(timePeriod);
            if (!timePeriod.key.startsWith('custom')) {
                $('#newDatePickerBox').hide();
                $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
            } else {
                $('#newDatePickerBox').show();
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

            cdbDropdown.find('li').click(
                function (e) {
                    var clickedDateRange = e.target.id,
                        clickedDateText = $(e.target).text();

                    if (clickedDateRange.startsWith('custom')) {
                        $rootScope.$broadcast(constants.EVENT_TIMEPERIOD_CHANGED);
                    }

                    localStorage.setItem('timeSetLocStore', JSON.stringify(clickedDateRange));
                    localStorage.setItem('timeSetTextLocStore', JSON.stringify(clickedDateText));

                    e.stopImmediatePropagation();
                }
            );
        };
    }]);
});
