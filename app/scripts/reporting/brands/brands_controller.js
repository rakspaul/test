define(['angularAMD', 'reporting/brands/brands_model', 'reporting/brands/brands_service', 'common/utils',
    'common/services/constants_service', 'login/login_model', 'reporting/advertiser/advertiser_model',
    'reporting/brands/brands_directive', 'reporting/subAccount/sub_account_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BrandsController', function ($scope, $rootScope, brandsModel, brandsService, utils,
                                                        constants, loginModel, advertiserModel, subAccountModel,
                                                        localStorageService) {
        var search = false,
            searchCriteria = utils.typeaheadParams,
            loadBrands = true,
            isLeafNode = localStorageService.masterClient.get().isLeafNode,

            eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD,
                function (event, args) {
                    $scope.selectBrand(args.brand, args.advertiser, args.event_type);
                }
            );

        function fetchBrands(searchCriteria, search) {
            if (loginModel.getUserId() === undefined) {
                return;
            }

            if(loadBrands) {
                searchCriteria.clientId = loginModel.getSelectedClient().id;
                searchCriteria.advertiserId = advertiserModel.getAdvertiser().selectedAdvertiser.id;
                search = false;
                loadBrands = false;

                brandsModel.getBrands(function(brandsData) {
                    $scope.brands = brandsData;
                }, searchCriteria, search);
            }
        }

        $scope.textConstants = constants;
        $scope.advertiser =  advertiserModel.getSelectedAdvertiser();
        $scope.isDashbboardBrand = subAccountModel.isDashboardSubAccount();

        if((advertiserModel.getAdvertiser().selectedAdvertiser) &&
            (advertiserModel.getAdvertiser().selectedAdvertiser.id)) {
            $scope.brandData = brandsModel.getBrand();

            if($scope.isDashbboardBrand && !isLeafNode) {
                $scope.brandData.selectedBrand = $scope.brandData.selectedDashboardBrand;
            }
        }

        $scope.selectBrand = function (brand, advertiser, event_type) {
            $('#brand_name_selected').text(brand.name);
            $('#brandsDropdown').attr('placeholder', brand.name).val('');
            $scope.brandData.showAll = true;
            brandsModel.setSelectedBrand(brand);
            brandsModel.callBrandBroadcast(brand, advertiser, event_type);
            $scope.selectedBrand = null;
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

        $scope.brandData = brandsModel.getBrand();

        $(function () {
            $('header').on('click', '#brandsDropdownDiv', function () {
                $('.brandsList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });

        $scope.$on(constants.EVENT_ADVERTISER_CHANGED, function(event, args) {
            var advertiser = args.advertiser;

            loadBrands = true;
            $scope.advertiser =  advertiser;
            $scope.brandData.selectedBrand = {};
            $scope.brandData.selectedBrand.name = '';
            $scope.selectBrand(brandsModel.getBrand().allBrandObject, advertiser, args.event_type);
        });

        $scope.$on('$destroy', function () {
            eventBrandChangedFromDashBoard();
        });
    });
});
