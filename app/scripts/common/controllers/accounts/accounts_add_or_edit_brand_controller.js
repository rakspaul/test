define(['angularAMD', 'admin-account-service'], function (angularAMD) {
    'use strict';
    angularAMD.controller('AccountsAddOrEditBrand', ['$scope', '$rootScope', '$modalInstance', 'adminAccountsService', 'domainReports', 'constants',
        function ($scope, $rootScope, $modalInstance, adminAccountsService, domainReports, constants ) {

            function createBrandUnderAdvertiser(brandId) {
                adminAccountsService
                    .createBrandUnderAdvertiser($scope.client.id, $scope.advertiser.id, brandId)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.fetchBrands($scope.client.id, $scope.advertiser.id);
                            $scope.resetBrandAdvertiserAfterEdit();
                            $scope.close();
                            $rootScope.setErrAlertMessage('Brands add successfully', 0);
                        }
                    }, function (err) {
                        $scope.close();
                        $rootScope.setErrAlertMessage('Error in creating brand under advertiser: ' + err);
                    });
            }

            $scope.close = function () {
                $modalInstance.dismiss();
                $scope.resetBrandAdvertiserAfterEdit();
            };

            $scope.saveBrands = function () {
                if (!$scope.selectedBrandId || $scope.selectedBrandId === ''){
                    $rootScope.setErrAlertMessage(constants.EMPTY_BRAND_SELECTION);

                    return false;
                }

                if ($scope.mode !== 'edit') {
                    createBrandUnderAdvertiser($scope.selectedBrandId);
                }
            };
        }]);
});
