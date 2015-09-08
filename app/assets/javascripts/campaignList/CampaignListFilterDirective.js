(function () {
    'use strict';
    angObj.directive('campaignListFilterDirective', function (utils,constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_dashboard,

            link: function ($scope, element, attrs) {

            }
        };
    });

}());
