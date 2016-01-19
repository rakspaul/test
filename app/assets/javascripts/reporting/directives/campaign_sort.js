(function () {
    'use strict';
    angObj.directive('campaignSort', function (utils,constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_filters,

            link: function ($scope, element, attrs) {

                $scope.textConstants = constants;
            } 
        };
    });

}());