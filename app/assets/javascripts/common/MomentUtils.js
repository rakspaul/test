(function() {
  'use strict'

  angObj.service('momentService', ['loginModel', function(loginModel) {
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
  }]);
}());