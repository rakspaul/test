(function () {
    'use strict';
    angObj.directive('campaignListSort', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_list_filters,

            link: function ($scope, element, attrs) {

                $scope.textConstants = constants;
            } 
        };
    });

}());
