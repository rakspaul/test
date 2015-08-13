(function() {
  'use strict'

  angObj.service('momentService', ['loginModel', 'constants',function(loginModel,constants) {
    this.today = function() {
      var m = moment.tz(loginModel.networkTimezone());
      return m.startOf("day");
    },

    this.newMoment = function(date) {
      if(_.isDate(date)) {
        return this.newMoment(moment(date).format('YYYY-MM-DD'));
      }
      if(_.isString(date) || _.isNumber(date)) {
        return moment.tz(date, loginModel.networkTimezone());
      }
    };

    this.reportDateFormat = function(reportDateTime) {
      //var reportDateTime = "2015-08-12 01:22:41";

      var yesterday = moment().subtract(1, 'day');
      if(moment(reportDateTime).startOf('day').isSame(moment().startOf('day'))) {
        return moment(reportDateTime).format("HH:mm A");
      } else if(moment(reportDateTime).isSame(yesterday, 'day')) {
        return constants.YESTERDAY;
      } else {
         return moment(reportDateTime).format("D MMM YYYY HH:mm A");
      }

    }


  }]);
}());