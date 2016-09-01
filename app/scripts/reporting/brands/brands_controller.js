define(['angularAMD', 'brands-service', 'common-utils', 'brands-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BrandsController', ['$scope', '$rootScope', '$routeParams', '$location', 'brandsModel',
        'brandsService', 'utils', 'constants', 'vistoconfig', function ($scope, $rootScope, $routeParams, $location, brandsModel,
                                                        brandsService, utils, constants, vistoconfig) {
        var search = false,
            searchCriteria = utils.typeAheadParams,

            fetchBrands = function() {
                var accountId = $routeParams.subAccountId || $routeParams.accountId,
                    advertiserId = $routeParams.advertiserId;

                brandsModel
                    .fetchBrandList(accountId, advertiserId)
                    .then(function() {
                        $scope.brands = brandsModel.getBrandList();
                        console.log('$scope.brands', $scope.brands.length);

                        if (brandsModel.allowedBrand($routeParams.brand_id)) {
                            $scope.selectedBrand = vistoconfig.getSelectedBrandId();
                        } else {
                            console.log('brand not allowed');
                            $location.url('/tmp');
                        }
                    });
            };

        if(localStorage.getItem('topAlertMessage')) {
            $rootScope.setErrAlertMessage(constants.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_BRAND);
        }
        $scope.textConstants = constants;

        // used to enable the brands drop-down
        $scope.advertiser_id = $routeParams.advertiserId;


        $scope.selectBrand = function (brand) {
            $('#brand_name_selected').text(brand.name);
            $('#brandsDropdown').attr('placeholder', brand.name).val('');

            brandsModel.changeBrand($routeParams.accountId,
                $routeParams.subAccountId, $routeParams.advertiserId, brand);
        };


        $scope.brandsDropdownClicked = function () {
            var brandsList = $('#brandsList');

            fetchBrands(searchCriteria, search);
            brandsList.toggle();
            $('#cdbMenu').closest('.each_filter').removeClass('filter_dropdown_open');
            brandsList.closest('.each_filter').toggleClass('filter_dropdown_open');
            $('#cdbDropdown').hide();
            $('#profileDropdown').hide();
        };

        $scope.disableShowAll = function () {
            $scope.brandData.showAll = false;
        };

        $scope.highlightSearch = function (text, search) {
            return utils.highlightSearch(text, search);
        };

        $(function () {
            $('header').on('click', '#brandsDropdownDiv', function () {
                $('.brandsList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });

    }]);
});
