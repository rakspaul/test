define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BrandsListController', ['$scope', 'constants', function ($scope, constants) {
        function applyBrandFilter() {
            var filter = $scope.selectedBrand.brandName.toUpperCase(),
                value = $scope.brand.brandName.toUpperCase(),
                isSubString = (value.indexOf(filter) > -1);

            if ($scope.selectedBrand &&
                ($scope.selectedBrand.brandName === undefined ||
                $scope.selectedBrand.brandName.length < 1)) {
                $scope.isExcludedByBrandFilter = false;

                return;
            }

            if (value === constants.ALL_BRANDS.toUpperCase()) {
                return;
            }

            $scope.isExcludedByBrandFilter = !isSubString && ($scope.brandData.showAll === false);
        }

        $scope.$watch('selectedBrand.brandName', function (newName, oldName) {
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
    }]);
});
