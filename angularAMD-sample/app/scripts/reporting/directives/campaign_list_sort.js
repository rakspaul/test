define(['angularAMD', 'common/services/constants_service'

],function (angularAMD) {
    'use strict';
    angularAMD.directive('campaignListSort', function (constants) {
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

});
