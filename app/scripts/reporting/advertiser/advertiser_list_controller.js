define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdvertiserListController', function ($scope, constants) {
        function applyAdvertiserFilter() {
            var filter = $scope.selectedAdvertiser.name.toUpperCase(),
                value = $scope.advertiser.name.toUpperCase(),
                isSubString = (value.indexOf(filter) > -1);

            if ($scope.selectedAdvertiser.name === undefined || $scope.selectedAdvertiser.name.length < 1) {
                $scope.isExcludedByAdvertiserFilter = false;

                return;
            }

            if (value === constants.ALL_ADVERTISERS.toUpperCase()) {
                return;
            }

            $scope.isExcludedByAdvertiserFilter = !isSubString && ($scope.advertiserData.showAll === false);
        }

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
    });
});
