define(['angularAMD', '../../controllers/gauge_controller'], function (angularAMD) {
    'use strict';

    angularAMD.directive('gauge', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_gauge,
            link: function() {}
        };
    });
});
