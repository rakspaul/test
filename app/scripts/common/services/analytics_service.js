define(['angularAMD', 'libs/angulartics.min'], function (angularAMD) { // jshint ignore:line
    angularAMD.service('analytics', ['angulartics',function() {
    this.track =
        function(category, action, label, loginName, value) { // jshint ignore:line
            ga('set', 'dimension1', loginName); // jshint ignore:line
        };
    }]);
});
