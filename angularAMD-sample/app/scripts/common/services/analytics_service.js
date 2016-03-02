define(['angularAMD', 'libs/angulartics.min'],function (angularAMD) {
    angularAMD.service("analytics", ['angulartics',function(angulartics) {
    this.track = function(category, action, label, loginName, value) {
      ga('set', 'dimension1', loginName);
      if(value !== undefined) {
        analytics.eventTrack(action, { category: category, label: label, value: value});
      } else {
        analytics.eventTrack(action, { category: category, label: label});
      }
    }
 }]);
});