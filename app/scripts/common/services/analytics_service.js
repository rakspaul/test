define(['angularAMD', 'libs/angulartics.min'], function (angularAMD) {
    'use strict';

    angularAMD.service('analytics', ['angulartics',function() {
        this.track =
            function(category, action, label, loginName) {
                // TODO: What is ga global variable here???
                ga('set', 'dimension1', loginName); // jshint ignore:line
            };
        }
    ]);
});
