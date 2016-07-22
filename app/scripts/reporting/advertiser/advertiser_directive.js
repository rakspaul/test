define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('advertiserDropDown',  function () {
        return {
            restrict: 'EAC',

            templateUrl: assets.html_advertiser_drop_down,

            link: function() {
                $('.advertisersList_ul').scrollWithinDiv();
            }
        };
    });
});
