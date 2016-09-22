define(['angularAMD', 'admin-account-service', 'lrInfiniteScroll'], function (angularAMD) {
    'use strict';
    angularAMD.controller('AccountsAddOrEditBrand', ['$scope', '$rootScope', '$modalInstance', '$routeParams', 'adminAccountsService', 'domainReports', 'constants',
        function ($scope, $rootScope, $modalInstance, $routeParams, adminAccountsService, domainReports, constants ) {
            var searchBrandsTimer = 0;

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

            $scope.searchBrands = function () {
                if (searchBrandsTimer) {
                    clearTimeout(searchBrandsTimer);
                }

                searchBrandsTimer = setTimeout(function () {
                    $scope.$parent.brandsLoading = true;
                    $scope.$parent.brandsPageNo = 0;
                    $scope.$parent.brandsData = [];
                    $scope.fetchAllBrands($routeParams.accountId, $scope.brandsQuery, $scope.$parent.brandsPageSize, $scope.$parent.brandsPageNo);
                }, 400);
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
                $('#brandsSearchBox').focus();
            };

            $scope.hideBrandsDropDown = function () {
                var brandNameSelected = $('#brandNameSelected'),
                    iconArrowSolidDown = $('.icon-arrow-solid-down'),
                    adminBrandsDropdownList = $('.admin-brand-dropdown-menu');

                adminBrandsDropdownList.css('display', '');
                brandNameSelected.css('display', 'block');
                iconArrowSolidDown.css('display', 'block');
            };

            $scope.loadMoreBrands = function () {
                if (!$scope.$parent.noMoreBrandsToLoad) {
                    $scope.fetchAllBrands($scope.clientId, $scope.brandsQuery, $scope.$parent.brandsPageSize, $scope.$parent.brandsPageNo);
                }
            };

            $(document).click(function (event) {
                if (event.target.id === 'adminBrandsDropDownList' || event.target.id === 'brandsSearchBox') {
                    return;
                }

                $scope.hideBrandsDropDown();
            });
        }
    ]);
});
