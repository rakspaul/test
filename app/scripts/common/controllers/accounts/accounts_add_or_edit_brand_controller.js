var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditBrand', function ($scope, $rootScope, $modalInstance, accountsService) {
        $scope.close=function () {
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.saveBrands = function () {
            var brandObj,
                body;

            if ($scope.mode === 'edit') {
                brandObj =  accountsService.getToBeEditedBrand();
                body = constructRequestBody(brandObj);
                accountsService.updateBrand(body,body.id).then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchBrands($scope.client.id, $scope.advertiser.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        $rootScope.setErrAlertMessage('Brands updated successfully', 0);
                    }

                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating brand.');
                });
            } else if ($scope.selectedBrandId !== '') {
                //when user does select and existing brand under a advertiser
                createBrandUnderAdvertiser($scope.selectedBrandId);
            } else {
                body = constructRequestBody();
                accountsService.createBrand(body).then(function (brand) {
                    if (brand.status === 'OK' || brand.status === 'success') {
                        createBrandUnderAdvertiser(brand.data.data.id)
                    }
                });
            }
        };

        function createBrandUnderAdvertiser(brandId) {
            accountsService
                .createBrandUnderAdvertiser($scope.client.id, $scope.advertiser.id, brandId)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.fetchBrands($scope.client.id,$scope.advertiser.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        $rootScope.setErrAlertMessage('Brands created successfully', 0);
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating brand under advertiser.');
                });
        }

        function constructRequestBody(obj) {
            var respBody = {};

            if ($scope.mode === 'edit' && obj) {
                respBody.name = $scope.brandName;
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
            } else {
                respBody.name = $scope.brandName;
            }
            return respBody;
        }
    });
});
