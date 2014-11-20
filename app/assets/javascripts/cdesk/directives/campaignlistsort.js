(function () {
    'use strict';
    angObj.directive('campaignListSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: 'campaign_list_filters',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());