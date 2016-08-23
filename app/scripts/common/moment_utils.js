define(['angularAMD', 'moment', 'login/login_model', 'common/services/constants_service',
    'common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('momentService', ['loginModel', 'constants', 'vistoconfig',
        function (loginModel, constants, vistoconfig) {

            this.today = function () {

                var tz = this.getTimezoneName();
                var m = moment.tz(tz);
                return m.startOf('day');
            };

            this.getCurrentYear = function () {

                return this.today().year();

            };

            this.isDateBefore = function (date1, date2) {

                return moment(date1).isBefore(date2);

            };

            this.isSameOrAfter = function (date1, date2) {

                if (moment(date1).isSame(date2)) {
                    return true;
                }

                return moment(date1).isAfter(date2);

            };

            this.newMoment = function (date) {

                var tz = this.getTimezoneName();

                if (_.isDate(date)) {
                    return this.newMoment(moment(date).format('YYYY-MM-DD'));
                }

                if (_.isString(date) || _.isNumber(date)) {
                    return moment(date).tz(tz);
                }

            };

            this.addDays = function (dateFormat, noOfDays) {

                return moment().add('days', noOfDays).format(dateFormat);

            };

            this.addDaysCustom = function (date, dateFormat, noOfDays) {

                return moment(date).add('days', noOfDays).format(dateFormat);

            };

            this.substractDaysCustom = function (date, dateFormat, noOfDays) {

                return moment(date).subtract(noOfDays, 'days').format(dateFormat);

            };

            this.reportDateFormat = function (reportDateTime) {

                var yesterday = moment().subtract(1, 'day');

                if (moment(reportDateTime).startOf('day').isSame(moment().startOf('day'))) {
                    return moment(reportDateTime).format('HH:mm A');
                } else if (moment(reportDateTime).isSame(yesterday, 'day')) {
                    return constants.YESTERDAY;
                } else {
                    return moment(reportDateTime).format('D MMM YYYY HH:mm A');
                }

            };

            // function can be called as momentService.todayDate('YYYY-MM-DD')
            this.todayDate = function (dateFormat) {

                return moment().format(dateFormat);

            };

            this.dateDiffInDays = function (date1, date2) {

                var d1 = moment(date1),
                    d2 = moment(date2);

                return moment.duration(d2.diff(d1)).asDays();

            };

            this.isGreater = function (date1, date2) {

                var d1 = moment(date1),
                    d2 = moment(date2);

                if (d2.diff(d1) < 0) {
                    return true;
                }
                return false;

            };

            /*
             NEW METHODS START HERE -- Lalding (5th Jan 2016)
             Get timezone name stored in localStorage ('clientRoleObj').
             */

            this.getTimezoneName = function () {

                var clientRoleObj = JSON.parse(localStorage.getItem('clientRoleObj'));

                if (clientRoleObj && clientRoleObj.timezoneName) {
                    return clientRoleObj.timezoneName;
                }

            };

            /*
             Set the timezone name based on the timezone abbreviation, and store in localStorage ('clientRoleObj').
             */

            this.setTimezoneName = function (timezone, clientRoleObj) {

                clientRoleObj.timezoneName = vistoconfig.timeZoneNameMapper[timezone];

            };

            /*
             Create a new moment object based on the timezoneName stored in LocalStorage ('clientRoleObj').
             and retrieved using getTimezoneName().
             */

            this.getTimezoneMoment = function (dateTime) {

                if (typeof dateTime === 'undefined') {
                    // If time is not given, use system date.
                    return moment.tz(this.getTimezoneName());
                } else {
                    // If time is given, use it.
                    return moment.tz(dateTime, this.getTimezoneName());
                }

            };

            /*
             Create a new moment object and store it in LocalStorage ('clientRoleObj').
             NOTE: The moment object gets serialised when it's stored in LocalStorage.
             */

            this.setTimezoneMoment = function (clientRoleObj) {

                clientRoleObj.timezoneMoment = moment.tz(this.getTimezoneName());

            };

            /*
             Convert local time (EST, GMT, etc.) to UTC before sending to backend for saving.
             Also, startTime is forced to beginning of day & endTime to end of day.
             */

            this.localTimeToUTC = function (dateTime, type, timezone, isDateChanged) {

                var clientUTCTime,
                    parseDateTime,
                    currentUTCTime,
                    tz,
                    timeZoneCode,
                    timeSuffix = (type === 'startTime' ? '00:00:00' : '23:59:59');

                if (typeof isDateChanged === 'undefined') {
                    isDateChanged = true;
                }

                if (timezone) {
                    timeZoneCode = vistoconfig.timeZoneNameMapper[timezone];
                    tz = moment(dateTime).tz(timeZoneCode).format('z');
                } else {
                    tz = moment(dateTime).tz(this.getTimezoneName()).format('z');
                }

                parseDateTime = Date.parse(dateTime + ' ' + timeSuffix + ' ' + tz);
                clientUTCTime = moment(parseDateTime).tz('UTC');
                currentUTCTime = moment.utc();

                if (isDateChanged && moment(clientUTCTime).isBefore(currentUTCTime)) {
                    clientUTCTime = moment(currentUTCTime).add(10, 'seconds');
                }

                return moment(clientUTCTime).format(constants.DATE_UTC_FORMAT);

            };

            /*
             Convert UTC to local time (EST, GMT, etc. when loading data for edit.
             */

            this.utcToLocalTime = function (dateTime, dtFormat) {

                var d,
                    parsedDate,
                    tz,
                    format;

                format = dtFormat || constants.DATE_US_FORMAT;

                if (!dateTime) {

                    return moment().format(format);

                } else {

                    d = dateTime.slice(0, 10).split('-');
                    parsedDate = Date.parse(d[1] + '/' + d[2] + '/' + d[0] + ' ' + dateTime.slice(11, 19) + ' UTC');
                    tz = this.getTimezoneName();
                    return moment(parsedDate).tz(tz) && moment(parsedDate).tz(tz).format(format);
                }

            };

            this.formatDate = function (dateTime, format) {

                return moment(dateTime).format(format);

            };
        }]);
});
