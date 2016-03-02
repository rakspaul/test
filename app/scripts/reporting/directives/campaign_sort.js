define(['angularAMD', '../../common/services/constants_service'

],function (angularAMD) {
    'use strict';
    angularAMD.directive('campaignSort', function (constants) {
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

});
