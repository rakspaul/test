var angObj = angObj || {};

define(['angularAMD','../../../workflow/services/account_service','reporting/models/domain_reports', '../../services/constants_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('AccountsAddOrEditBrand', function ($scope, $rootScope, $modalInstance,
            accountsService, domainReports, constants ) {
            $scope.close=function () {
                $modalInstance.dismiss();
                $scope.resetBrandAdvertiserAfterEdit();
            };

            $scope.saveBrands = function () {
                var brandObj,
                    body,
                    requestData;
                if(!$scope.selectedBrandId || $scope.selectedBrandId == ""){
                    $rootScope.setErrAlertMessage(constants.EMPTY_BRAND_SELECTION);
                    return false;
                }
                if ($scope.mode === 'edit') {
                    // Code to Edit the brand
//            } else if ($scope.selectedBrandId !== '') {
//                //when user does select and existing brand under a advertiser
//                createBrandUnderAdvertiser($scope.selectedBrandId);
                } else {
                    createBrandUnderAdvertiser($scope.selectedBrandId)
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
                            $rootScope.setErrAlertMessage('Brands add successfully', 0);
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