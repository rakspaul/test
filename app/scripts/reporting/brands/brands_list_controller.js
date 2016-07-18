define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BrandsListController', function ($scope, constants) {
        function applyBrandFilter() {
            var filter = $scope.selectedBrand.name.toUpperCase(),
                value = $scope.brand.name.toUpperCase(),
                isSubString = (value.indexOf(filter) > -1);

            if ($scope.selectedBrand &&
                ($scope.selectedBrand.name === undefined ||
                $scope.selectedBrand.name.length < 1)) {
                $scope.isExcludedByBrandFilter = false;

                return;
            }

            if (value === constants.ALL_BRANDS.toUpperCase()) {
                return;
            }

            $scope.isExcludedByBrandFilter = !isSubString && ($scope.brandData.showAll === false);
        }

        $scope.$watch('selectedBrand.name', function (newName, oldName) {
            if (newName === oldName) {
                return;
            }

            applyBrandFilter();
        });

        $scope.$watch('brandData.showAll', function (newBool, oldBool) {
            if (newBool === oldBool || newBool === false) {
                return;
            }

            applyBrandFilter();
        });
    });
});
