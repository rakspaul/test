(function () {
    'use strict';
    angObj.directive('campaignListSort', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: '/assets/html/orders/_campaign_list_filters.html',

            link: function ($scope, element, attrs) {

                
            } 
        };
    });

}());
