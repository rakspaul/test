(function () {
    'use strict';
    angObj.directive('campaignSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: '/assets/html/campaign_filters.html',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());
