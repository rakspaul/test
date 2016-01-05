(function() {
    'use strict';

    angObj.service('momentService', ['loginModel', 'constants', function(loginModel, constants) {
        this.today = function() {
            var m = moment.tz(loginModel.networkTimezone());
            return m.startOf('day');
        };

        this.newMoment = function(date) {
            if(_.isDate(date)) {
                return this.newMoment(moment(date).format('YYYY-MM-DD'));
            }
            if(_.isString(date) || _.isNumber(date)) {
                return moment.tz(date, loginModel.networkTimezone());
            }
        };

        this.reportDateFormat = function(reportDateTime) {
            //var reportDateTime = '2015-08-12 01:22:41';

            var yesterday = moment().subtract(1, 'day');
            if(moment(reportDateTime).startOf('day').isSame(moment().startOf('day'))) {
                return moment(reportDateTime).format('HH:mm A');
            } else if(moment(reportDateTime).isSame(yesterday, 'day')) {
                return constants.YESTERDAY;
            } else {
                return moment(reportDateTime).format('D MMM YYYY HH:mm A');
            }
        };

        //function can be called as momentService.todayDate('YYYY-MM-DD')
        this.todayDate = function(dateFormat) {
            return moment().format(dateFormat);
        };

        this.dateDiffInDays = function(date1,date2) {
            var d1 = moment(date1);
            var d2 = moment(date2);

            return moment.duration(d2.diff(d1)).asDays();
        };

        this.isGreater = function(date1, date2) {
            var d1 = moment(date1);
            var d2 = moment(date2);

            if(d2.diff(d1) < 0) {
                return true;
            }
            return false;
        };

        // NEW METHODS START HERE -- Lalding (5th Jan 2016)
        // Get timezone name stored in localStorage ('clientRoleObj').
        this.getTimezoneName = function () {
            var clientRoleObj =  JSON.parse(localStorage.getItem('clientRoleObj'));
            return clientRoleObj.timezoneName;
        };

        // Set the timezone name based on the timezone abbreviation, and store in localStorage ('clientRoleObj').
        this.setTimezoneName = function (timezone, clientRoleObj) {
            if (timezone === 'BST' || timezone === 'GB') {
                // Set to British time for all UK
                clientRoleObj.timezoneName = 'Europe/London';
            } else {
                // For all other timezones, set it to EST
                clientRoleObj.timezoneName = 'America/New_York';
            }
        };

        // Create a new moment object based on the timezoneName stored in LocalStorage ('clientRoleObj').
        // and retrieved using getTimezoneName().
        this.getTimezoneMoment = function (dateTime) {
            if (typeof dateTime === 'undefined') {
                // If time is not given, use system date.
                return moment.tz(this.getTimezoneName());
            } else {
                // If time is given, use it.
                return moment.tz(dateTime, this.getTimezoneName());
            }
        };

        // Create a new moment object and store it in LocalStorage ('clientRoleObj').
        // NOTE: The moment object gets serialised when it's stored in LocalStorage.
        this.setTimezoneMoment = function (clientRoleObj) {
            clientRoleObj.timezoneMoment = moment.tz(this.getTimezoneName());
        };
        // NEW METHODS END HERE -- Lalding (5th Jan 2016)
    }]);
}());