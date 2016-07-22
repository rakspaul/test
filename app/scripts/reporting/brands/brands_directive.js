define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('brandsDropDown', function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_brands_drop_down,

            link: function () {
                $('.brandsList_ul').scrollWithinDiv();
            }
        };
    });
});
