define(['angularAMD', 'common/services/constants_service'], function (angularAMD) {
    'use strict';
    angularAMD.factory("timePeriodModel", function (constants) {
        var buildTimePeriodList = function () {
            return [
                createTimePeriodObject('Last 7 days', 'last_7_days'),
                createTimePeriodObject('Last 30 days', 'last_30_days'),
                createTimePeriodObject('Lifetime', 'life_time', 'active'),
                createTimePeriodObject('Custom', 'custom')
            ];

        };
        var timePeriodApiMapping = function (key) {
            var apiObj = {
                'last_week': 'last_7_days',
                'last_month': 'last_30_days',
                'life_time': 'life_time'
            };
            return apiObj[key];
        };
        var createTimePeriodObject = function (display, key, className) {
            var obj = {
                "display": display,
                "key": key
            };
            obj.className = (className == undefined ? '' : className);
            return obj;
        };
        var tpModel = function () {
            this.timeData = {};
            this.timeData.timePeriodList = buildTimePeriodList();
            this.timeData.selectedTimePeriod = this.timeData.timePeriodList[2];
            var self = this;

            var fromLocStoreTime = localStorage.getItem('timeSetLocStore');
            if (fromLocStoreTime) {
                fromLocStoreTime = JSON.parse(localStorage.getItem('timeSetLocStore'));
                this.timeData.selectedTimePeriod.key = fromLocStoreTime;
            }

            var fromLocStore = JSON.parse(localStorage.getItem('timeSetTextLocStore'));
            if (fromLocStore !== null) {
                this.timeData.displayTimePeriod = fromLocStore; //
            }
            else {
                this.timeData.displayTimePeriod = this.timeData.selectedTimePeriod.display;
            }

            //this.timeData.displayTimePeriod = this.timeData.selectedTimePeriod.display;
            this.selectTimePeriod = function (timePeriod) {
                self.timeData.timePeriodList = buildTimePeriodList();
                self.timeData.selectedTimePeriod = timePeriod;
                self.timeData.displayTimePeriod = timePeriod.display;
                $("#cdbDropdown").toggle();
                self.timeData.timePeriodList.forEach(function (period) {
                    if (period == timePeriod) {
                        period.className = 'active';
                    } else {
                        period.className = '';
                    }
                });

            };

            this.getTimePeriod = function(dateFilter) {
                if(dateFilter == 'custom') {
                    var todayDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                    var localStorageStartDate = JSON.parse(localStorage.getItem('customStartDate'));
                    var localStorageEndDate = JSON.parse(localStorage.getItem('customEndDate'));

                    if(localStorageStartDate && localStorageEndDate) {
                        console.log("custom&start_date=" + localStorageStartDate + "&end_date=" + localStorageEndDate);
                        return "custom&start_date=" + localStorageStartDate + "&end_date=" + localStorageEndDate;
                    } else {
                        console.log("custom&start_date=" + todayDate + "&end_date=" + todayDate);
                        return "custom&start_date=" + todayDate + "&end_date=" + todayDate;
                    }
                } else {
                    return dateFilter;
                }
            }


        };
        return new tpModel();
    });
});
