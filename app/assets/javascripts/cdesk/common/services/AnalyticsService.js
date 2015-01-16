(function() {

  var tracking = function(analytics) {
    this.track = function(category, action, label, value) {
      console.log("tracking: "+category + "_" + action + "_" + label);
      if(value !== undefined) {
        analytics.eventTrack(action, { category: category, label: label, value: value});
      } else {
        console.log('here now');
        analytics.eventTrack(action, { category: category, label: label});
      }
    }
  };

  commonModule.service("analytics", ['$analytics', tracking]);

}());