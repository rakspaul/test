define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('campaignCostSort', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_cost_filters, // jshint ignore:line

            link: function ($scope) {
                $scope.textConstants = constants;
            }
        };
    });
});
