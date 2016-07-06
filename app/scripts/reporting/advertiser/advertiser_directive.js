define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('advertiserDropDown',  function () {
        return {
            restrict: 'EAC',

            templateUrl: assets.html_advertiser_drop_down, // jshint ignore:line

            link: function() {
                $('.advertisersList_ul').scrollWithInDiv();
            }
        };
    });
});

