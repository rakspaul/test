(function () {
    'use strict';
    angObj.directive('campaignCostSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: '/assets/html/campaign_cost_filters.html',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());
