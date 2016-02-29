define(['angularAMD','common/services/constants_service'], function (angularAMD) {
    'use strict';
    angularAMD.controller('AdvertiserListController', function ($scope, constants) {

        $scope.$watch('selectedAdvertiser.name', function (newName, oldName) {
            if (newName === oldName) {
                return;
            }
            applyAdvertiserFilter();
        });
        $scope.$watch('advertiserData.showAll', function (newBool, oldBool) {
            if (newBool === oldBool || newBool === false) {
                return;
            }
            applyAdvertiserFilter();
        });
        function applyAdvertiserFilter() {
            if ($scope.selectedAdvertiser.name == undefined || $scope.selectedAdvertiser.name.length < 1) {
                $scope.isExcludedByAdvertiserFilter = false;
                return;
            }
            var filter = $scope.selectedAdvertiser.name.toUpperCase();
            var value = $scope.advertiser.name.toUpperCase();
            if (value == constants.ALL_ADVERTISERS.toUpperCase()) {
                return;
            }
            var isSubString = (value.indexOf(filter) > -1);
            $scope.isExcludedByAdvertiserFilter = !isSubString && ($scope.advertiserData.showAll === false);
        };
    });
});