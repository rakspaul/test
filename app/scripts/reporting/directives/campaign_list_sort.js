define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignListSort', ['constants', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_list_filters,

            link: function ($scope) {
                $scope.textConstants = constants;
            }
        };
    }]);
});
