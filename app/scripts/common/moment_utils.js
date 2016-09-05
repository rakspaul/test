define(['angularAMD'], function (angularAMD) {
    angularAMD.service('momentService', ['loginModel', 'constants', 'vistoconfig',
        function (loginModel, constants, vistoconfig) {

            var mappedDateParse = function(dateString) {
                var timeZoneDesignatorMap = {
                    akdt : '-0800',
                    akst : '-0900',
                    art : '-0300'
                };

                var name, newDateString, regex;

                for (name in timeZoneDesignatorMap) {
                    regex = new RegExp(name, 'i');
                    if (dateString.search(regex) !== -1) {
                        newDateString = dateString.replace(regex, timeZoneDesignatorMap[name]);
                        return Date.parse(newDateString);
                    }
                }

                return Date.parse(dateString);
            }

            this.today = function () {

                var tz = vistoconfig.getClientTimeZone();
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

                var tz = vistoconfig.getClientTimeZone();

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
             Create a new moment object based on the timezoneName stored in LocalStorage ('clientRoleObj').
             and retrieved using getTimezoneName().
             */

            this.getTimezoneMoment = function (dateTime) {

                if (typeof dateTime === 'undefined') {
                    // If time is not given, use system date.
                    return moment.tz(vistoconfig.getClientTimeZone());
                } else {
                    // If time is given, use it.
                    return moment.tz(dateTime, vistoconfig.getClientTimeZone());
                }

            };


            /*
             Convert local time (EST, GMT, etc.) to UTC before sending to backend for saving.
             Also, startTime is forced to beginning of day & endTime to end of day.
             */

            this.localTimeToUTC = function (dateTime, type, isDateChanged) {

                var clientUTCTime,
                    parseDateTime,
                    currentUTCTime,
                    tz,
                    timeSuffix = (type === 'startTime' ? '00:00:00' : '23:59:59');

                if (typeof isDateChanged === 'undefined') {
                    isDateChanged = true;
                }

                tz = moment(dateTime).tz(vistoconfig.getClientTimeZone()).format('z');
                parseDateTime = mappedDateParse(dateTime + ' ' + timeSuffix + ' ' + tz);
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
                    tz = vistoconfig.getClientTimeZone();
                    return moment(parsedDate).tz(tz) && moment(parsedDate).tz(tz).format(format);
                }

            };

            this.formatDate = function (dateTime, format) {

                return moment(dateTime).format(format);

            };
        }]);
});
