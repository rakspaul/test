define(['angularAMD', 'moment', 'login/login_model', 'common/services/constants_service'], // jshint ignore:line
    function(angularAMD) {
        angularAMD.service('momentService', ['loginModel', 'constants', function(loginModel, constants) {
            this.today = function() {
                var m = moment.tz(loginModel.networkTimezone()); // jshint ignore:line

                return m.startOf('day');
            };

            this.getCurrentYear = function() {
                return this.today().year();
            };

            //eg: moment('2010-10-20').isBefore('2010-10-21');
            this.isDateBefore = function(date1, date2) {
                return moment(date1).isBefore(date2); // jshint ignore:line
            };

            this.isSameOrAfter = function(date1, date2) {
                if (moment(date1).isSame(date2)) { // jshint ignore:line
                    return true;
                }

                return moment(date1).isAfter(date2); // jshint ignore:line
            };

            this.newMoment = function(date) {
                if (_.isDate(date)) { // jshint ignore:line
                    return this.newMoment(moment(date).format('YYYY-MM-DD')); // jshint ignore:line
                }

                if (_.isString(date) || _.isNumber(date)) { // jshint ignore:line
                    return moment.tz(date, loginModel.networkTimezone()); // jshint ignore:line
                }
            };

            this.addDays = function(dateFormat, noOfDays) {
                return moment().add('days', noOfDays).format(dateFormat); // jshint ignore:line
            };

            this.addDaysCustom = function(date, dateFormat, noOfDays) {
                return moment(date).add('days', noOfDays).format(dateFormat); // jshint ignore:line
            };
            this.substractDaysCustom = function(date, dateFormat, noOfDays) {
                return moment(date).subtract(noOfDays , 'days').format(dateFormat); // jshint ignore:line
            };

            this.reportDateFormat = function(reportDateTime) {
                var yesterday = moment().subtract(1, 'day'); // jshint ignore:line

                if (moment(reportDateTime).startOf('day').isSame(moment().startOf('day'))) { // jshint ignore:line
                    return moment(reportDateTime).format('HH:mm A'); // jshint ignore:line
                } else if (moment(reportDateTime).isSame(yesterday, 'day')) { // jshint ignore:line
                    return constants.YESTERDAY;
                } else {
                    return moment(reportDateTime).format('D MMM YYYY HH:mm A'); // jshint ignore:line
                }
            };

            //function can be called as momentService.todayDate('YYYY-MM-DD')
            this.todayDate = function(dateFormat) {
                return moment().format(dateFormat); // jshint ignore:line
            };

            this.dateDiffInDays = function(date1, date2) {
                var d1 = moment(date1), // jshint ignore:line
                    d2 = moment(date2); // jshint ignore:line

                return moment.duration(d2.diff(d1)).asDays(); // jshint ignore:line
            };

            this.isGreater = function(date1, date2) {
                var d1 = moment(date1), // jshint ignore:line
                    d2 = moment(date2); // jshint ignore:line

                if (d2.diff(d1) < 0) {
                    return true;
                }
                return false;
            };

            // NEW METHODS START HERE -- Lalding (5th Jan 2016)
            // Get timezone name stored in localStorage ('clientRoleObj').
            this.getTimezoneName = function() {
                var clientRoleObj = JSON.parse(localStorage.getItem('clientRoleObj'));

                if (clientRoleObj && clientRoleObj.timezoneName) {
                    return clientRoleObj.timezoneName;
                }
            };

            // Set the timezone name based on the timezone abbreviation, and store in localStorage ('clientRoleObj').
            this.setTimezoneName = function(timezone, clientRoleObj) {
                if (timezone === 'BST' || timezone === 'GB') {
                    // Set to British time for all UK
                    clientRoleObj.timezoneName = constants.TIMEZONE_UK;
                } else {
                    // For all other timezones, set it to EST
                    clientRoleObj.timezoneName = constants.TIMEZONE_US;
                }
            };

            // Create a new moment object based on the timezoneName stored in LocalStorage ('clientRoleObj').
            // and retrieved using getTimezoneName().
            this.getTimezoneMoment = function(dateTime) {
                if (typeof dateTime === 'undefined') {
                    // If time is not given, use system date.
                    return moment.tz(this.getTimezoneName()); // jshint ignore:line
                } else {
                    // If time is given, use it.
                    return moment.tz(dateTime, this.getTimezoneName()); // jshint ignore:line
                }
            };

            // Create a new moment object and store it in LocalStorage ('clientRoleObj').
            // NOTE: The moment object gets serialised when it's stored in LocalStorage.
            this.setTimezoneMoment = function(clientRoleObj) {
                clientRoleObj.timezoneMoment = moment.tz(this.getTimezoneName()); // jshint ignore:line
            };

            // Convert local time (EST, GMT, etc.) to UTC before sending to backend for saving.
            // Also, startTime is forced to beginning of day & endTime to end of day.
            this.localTimeToUTC = function(dateTime, type) {
                var clientUTCTime,
                    parseDateTime,
                    currentUTCTime,
                    tz = this.getTimezoneName() === constants.TIMEZONE_UK ? 'GMT' : 'EST',
                    timeSuffix = (type === 'startTime' ? '00:00:00' : '23:59:59');

                parseDateTime = Date.parse(dateTime + ' ' + timeSuffix + ' ' + tz);
                clientUTCTime = moment(parseDateTime).tz('UTC'); // jshint ignore:line
                currentUTCTime  = moment.utc();

                if(moment(clientUTCTime).isBefore(currentUTCTime)) {
                    clientUTCTime = moment(currentUTCTime).seconds(10);
                }

                return moment(clientUTCTime).format(constants.DATE_UTC_FORMAT); // jshint ignore:line
            };

            // Convert UTC to local time (EST, GMT, etc. when loading data for edit.
            this.utcToLocalTime = function(dateTime, dtFormat) {
                var d,
                    parsedDate,
                    tz,
                    format;

                format = dtFormat || constants.DATE_US_FORMAT;

                if (!dateTime) {
                    return moment().format(format); // jshint ignore:line
                } else {
                    d = dateTime.slice(0, 10).split('-');
                    parsedDate = Date.parse(d[1] + '/' + d[2] + '/' + d[0] + ' ' + dateTime.slice(11, 19) + ' UTC');
                    tz = this.getTimezoneName() === constants.TIMEZONE_UK ? 'GMT' : 'EST';

                    return moment(parsedDate).tz(tz).format(format); // jshint ignore:line
                }
            };
        }]);
    }
);
