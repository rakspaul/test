(function () {
    'use strict';
    angObj.directive('campaignCostSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: 'campaign_cost_filters',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());