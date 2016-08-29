define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignCostSort', ['constants', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_cost_filters,

            link: function ($scope) {
                $scope.textConstants = constants;
            }
        };
    }]);
});
