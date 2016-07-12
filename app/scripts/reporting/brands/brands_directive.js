define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('brandsDropDown', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_brands_drop_down, // jshint ignore:line

            link: function () {
                $('.brandsList_ul').scrollWithInDiv();
            }
        };
    });
});