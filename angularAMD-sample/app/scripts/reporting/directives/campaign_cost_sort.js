define(['angularAMD', 'common/services/constants_service'

],function (angularAMD) {
    'use strict';
    angularAMD.directive('campaignCostSort', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_cost_filters,

            link: function ($scope, element, attrs) {
                $scope.textConstants = constants;
                
            } 
        };
    });

});
