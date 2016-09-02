define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.factory('timePeriodModel', ['constants', function (constants) {
        var buildTimePeriodList = function () {
                return [
                    createTimePeriodObject('Last 7 days', 'last_7_days'),
                    createTimePeriodObject('Last 30 days', 'last_30_days'),
                    createTimePeriodObject('Lifetime', 'life_time', 'active'),
                    createTimePeriodObject('Custom', 'custom')
                ];
            },

            createTimePeriodObject = function (display, key, className) {
                var obj = {
                    display: display,
                    key: key
                };

                obj.className = (className === undefined ? '' : className);

                return obj;
            },

            tpModel = function () {
                var self = this,
                    fromLocStoreTime = localStorage.getItem('timeSetLocStore'),
                    fromLocStore;

                this.timeData = {};
                this.timeData.timePeriodList = buildTimePeriodList();
                this.timeData.selectedTimePeriod = this.timeData.timePeriodList[2];

                if (fromLocStoreTime) {
                    fromLocStoreTime = JSON.parse(localStorage.getItem('timeSetLocStore'));
                    this.timeData.selectedTimePeriod.key = fromLocStoreTime;
                }

                fromLocStore = JSON.parse(localStorage.getItem('timeSetTextLocStore'));

                if (fromLocStore !== null) {
                    this.timeData.displayTimePeriod = fromLocStore;
                } else {
                    this.timeData.displayTimePeriod = this.timeData.selectedTimePeriod.display;
                }

                this.selectTimePeriod = function (timePeriod) {
                    self.timeData.timePeriodList = buildTimePeriodList();
                    self.timeData.selectedTimePeriod = timePeriod;
                    self.timeData.displayTimePeriod = timePeriod.display;
                    $('#cdbDropdown').toggle();

                    self.timeData.timePeriodList.forEach(function (period) {
                        if (period === timePeriod) {
                            period.className = 'active';
                        } else {
                            period.className = '';
                        }
                    });
                };

                this.getTimePeriod = function(dateFilter) {
                    if (dateFilter === 'custom') {
                        var todayDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                        if (self.timeFrameCustomDates && self.timeFrameCustomDates.startDate && self.timeFrameCustomDates.endDate) {
                            return 'custom&start_date=' + self.timeFrameCustomDates.startDate + '&end_date=' + self.timeFrameCustomDates.endDate;
                        } else {
                            return 'custom&start_date=' + todayDate + '&end_date=' + todayDate;
                        }
                    } else {
                        return dateFilter;
                    }
                };

                this.setTimeFilterCustomDates = function(date) {
                    self.timeFrameCustomDates = date;
                };

            };

        return new tpModel();
    }]);
});
