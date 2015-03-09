(function() {

  var momentInNetworkTZ = function(loginModel) {

    this.today = function() {
      var m = moment.tz(loginModel.networkTimezone());
      return m.startOf("day");
    },

    this.newMoment = function(date) {
      if(_.isDate(date)) {
        return this.newMoment(moment(date).format('YYYY-MM-DD'));
      }
      if(_.isString(date)) {
        return moment.tz(date, loginModel.networkTimezone());
      }
      if(_.isNumber(date)) {
        return moment.tz(date, loginModel.networkTimezone());
      }
    };
  };

  angObj.service('momentInNetworkTZ', ['loginModel', momentInNetworkTZ])
}());