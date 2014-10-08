(function () {
    'use strict';
    angObj.directive('campaignSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: 'campaign_filters',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());