(function () {
    'use strict';
    brandsModule.controller('BrandsController', function ($scope, brandsModel, brandsService, utils, $rootScope, constants, loginModel, analytics,advertiserModel) {

        var search = false;
        var searchCriteria = utils.typeaheadParams;
        $scope.textConstants = constants;
        $scope.advertiser =  advertiserModel.getSelectedAdvertiser();

        function resetSearch() {
            searchCriteria.limit = constants.DEFAULT_LIMIT_COUNT;
            searchCriteria.offset = constants.DEFAULT_OFFSET_START;
        }

        function fetchBrands(search) {
            brandsModel.getBrands(function (brandsData) {
                $scope.brands = brandsData;
            }, searchCriteria, search);
        }

        function init() {
            if (loginModel.getUserId() != undefined) {
                searchCriteria.clientId = loginModel.getSelectedClient().id;
                searchCriteria.advertiserId = advertiserModel.getAdvertiser().selectedAdvertiser.id;
                search = false;
                fetchBrands(search);
            }
        }
         if((advertiserModel.getAdvertiser().selectedAdvertiser) && (advertiserModel.getAdvertiser().selectedAdvertiser.id) ) {
             init();
             $scope.brandData = brandsModel.getBrand();
         }

        $scope.loadMoreBrands = function () {
            searchCriteria.offset += searchCriteria.limit;
            searchCriteria.key = $("#brandsDropdown").val();
            search = false;
            fetchBrands(search);
        };


        $scope.selectBrand = function (brand, advertiser, event_type) {
            $("#brand_name_selected").text(brand.name);
            $('#brandsDropdown').attr('placeholder', brand.name).val('');
            $scope.brandData.showAll = true;
            brandsModel.setSelectedBrand(brand);
            brandsModel.callBrandBroadcast(brand, advertiser, event_type);
            analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
        };


        $scope.brandsDropdownClicked = function () {
            $("#brandsList").toggle();
            $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
            $("#brandsList").closest(".each_filter").toggleClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
            $("#profileDropdown").hide();
        };

        $scope.disableShowAll = function () {
            $scope.brandData.showAll = false;
        };

        $scope.searchBrands = function () {
            var searchText = $("#brandsDropdown").val();
            if (searchCriteria.key === searchText)
                return;
            searchCriteria.key = searchText;
            $scope.exhausted = false;
            //Note: In case of search, we have to reset limit and offset values
            resetSearch();
            search = true;
            fetchBrands(search);
        };

        $scope.highlightSearch = function (text, search) {
            return utils.highlightSearch(text, search);
        };
        $scope.brandData = brandsModel.getBrand();
        
        $(function () {
            $("header").on('click', '#brandsDropdownDiv', function () {
                $('.brandsList_ul').scrollTop($(this).offset().top - 20 + 'px')
            });
        });

        $scope.$on(constants.EVENT_ADVERTISER_CHANGED, function(event, args) {
            var advertiser = args.advertiser;
            $scope.advertiser =  advertiser;
            $scope.brandData.selectedBrand = {};
            $scope.brandData.selectedBrand.name= '';
            searchCriteria.clientId = loginModel.getSelectedClient().id;
            $scope.selectBrand(brandsModel.getBrand().allBrandObject, advertiser, args.event_type);
            searchCriteria.advertiserId = advertiser.id;
            fetchBrands(searchCriteria, search);
        });

        var eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function (event, args) {
            $scope.selectBrand(args.brand, args.advertiser, args.event_type);
        });


        $scope.$on('$destroy', function () {
            eventBrandChangedFromDashBoard();
        });
    });
}());