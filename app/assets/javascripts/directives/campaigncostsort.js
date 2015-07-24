(function () {
    'use strict';
    angObj.directive('campaignCostSort', function (utils,constants) {
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

}());
