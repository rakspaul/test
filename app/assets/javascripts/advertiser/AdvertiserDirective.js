(function () {
    'use strict';
    angObj.directive('advertiserDropDown', ['utils', function (utils) {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_advertiser_drop_down,
            link: function(scope, element, attrs) {
                $('.brandsList_ul').scrollWithInDiv();
            }
        };
    }]);

}());

