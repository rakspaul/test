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

            $scope.searchBrands = function (e) {
                if (e.keyCode === 13) {
                    console.log('Enter key pressed! = ', $scope.clientId);
                    $scope.brandsPageNo = 0;
                    $scope.fetchAllBrands($scope.clientId, $scope.brandsQuery, $scope.brandsPageSize, $scope.brandsPageNo);
                }
            };

            $scope.selectBrandAndClose = function (brand) {
                $scope.selectBrand(brand);
                $scope.hideBrandsDropDown();
            };

            $scope.showBrandsDropDown = function (event) {
                var brandNameSelected = $('#brandNameSelected'),
                    iconArrowSolidDown = $('.icon-arrow-solid-down'),
                    adminBrandsDropdownList = $('.admin-brand-dropdown-menu');

                event && event.stopPropagation();

                brandNameSelected.css('display', 'none');
                iconArrowSolidDown.css('display', 'none');
                adminBrandsDropdownList.css('display', 'block');
            };

            $scope.hideBrandsDropDown = function () {
                var brandNameSelected = $('#brandNameSelected'),
                    iconArrowSolidDown = $('.icon-arrow-solid-down'),
                    adminBrandsDropdownList = $('.admin-brand-dropdown-menu');

                adminBrandsDropdownList.css('display', '');
                brandNameSelected.css('display', 'block');
                iconArrowSolidDown.css('display', 'block');
            };

            // TODO: scroll event is not getting registered!!!
            $('.brands-list').scroll(function () {
                console.log('scroll');
            });

            $(document).click(function (event) {
                if (event.target.id === 'adminBrandsDropDownList' || event.target.id === 'brandsSearchBox') {
                    return;
                }

                $scope.hideBrandsDropDown();
            });
        }
    ]);
});
