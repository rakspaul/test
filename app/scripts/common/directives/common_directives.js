define(['angularAMD'],  function (angularAMD) {
    'use strict';

    angularAMD.directive('header', ['$http', '$compile', 'constants',  function () {
        return {
            controller:  function () {
            },

            restrict: 'EAC',
            templateUrl: assets.html_header,

            link:  function () {

            }
        };
    }]);
});
