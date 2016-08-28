define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignSort', ['constants', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_filters,

            link: function ($scope) {
                $scope.textConstants = constants;
            }
        };
    }]);
});
