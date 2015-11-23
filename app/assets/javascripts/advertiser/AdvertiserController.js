(function () {
    'use strict';
    advertiserModule.controller('AdvertiserController', function ($scope,$routeParams, brandsModel, workflowService, advertiserModel, brandsService, utils, $rootScope, constants, loginModel, analytics) {


        var brand = {};
        brand.allBrandObject = {id: -1, name: constants.ALL_ADVERTISERS};
        brand.selectedBrand = brand.allBrandObject;
        brand.showList = false;
        brand.styleDisplay = "block";
        brand.showAll = true;
        brand.enable = true;
        brand.cssClass = "advertiserController";
        var brands = [brand.allBrandObject];
        var search = false;
        var newAdvertiserID ="";

        var searchCriteria = utils.typeaheadParams;

        $scope.textConstants = constants;


        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during immediate scroll down.
        $scope.fetching = false;

        function resetSearch() {
            searchCriteria.limit = constants.DEFAULT_LIMIT_COUNT;
            searchCriteria.offset = constants.DEFAULT_OFFSET_START;
            $scope.exhausted = false;
        }

        /**/
        var adverIDD = "3";
        var advertiserId = $scope.selectedCampaign.id;
        function getCreativesList (adverIDD)  {
            workflowService.getAdvertisers(adverIDD).then(function (result) {

                if(result){
                if (result.status === "OK" || result.status === "success" && result.data.data.length > 0) {
                    $scope.exhausted = true;
                    $scope.fetching = false;

                    var resData = result.data.data;
                    brands = [];
                    brands.push(brand.allBrandObject);
                    brands = brands.concat(resData);
                    $scope.advertiser3 = brands;
                } else {

                    //creativeList.errorHandler()
                }

                }
            });
        };

        function errorHandler () {
            $scope.creativesNotFound = true;
            $scope.creativeListLoading = false;
            $scope.creativeData['creatives'] = [];
            $scope.creativeData['creatives_count'] = 0;
        };
        getCreativesList(adverIDD);
        /**/
        /**/



        function fetchBrands(search) {
            brandsModel.getBrands(function (brandsData) {
                //data manipulation was already done in brandsModel, so just need to attach data to scope here
                //alert(brandsData.length +"  --  "+ searchCriteria.limit);
                if (brandsData.length < searchCriteria.limit)

                $scope.exhausted = true;
                $scope.fetching = false;
                $scope.brands = brandsData;
            }, searchCriteria, search);
        }


        if (loginModel.getUserId() != undefined)
            getCreativesList(searchCriteria, search);


        $scope.loadMoreBrands = function () {
            searchCriteria.offset += searchCriteria.limit;
            searchCriteria.key = $("#brandsDropdown").val();
            search = false;
            $scope.fetching = true;
            getCreativesList(search);
        };



        $scope.selectBrand2 = function (brand,newBrandID) {// brand here is really advertiser
            $("#brand_name_selected2").text(brand.name);
            $('#advertisersDropdownNew').attr('placeholder', brand.name).val('');
            $scope.advertiserData.showAll = true;
            brandsModel.setSelectedBrand(brand);
            brandsModel.callBrandBroadcast(brand);
            $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED,newBrandID);
            analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
        };


        $scope.brandsDropdownClicked2 = function () {
            $("#advertisersDropDownList").toggle();
            $("#cdbMenu").closest(".each_filter2").removeClass("filter_dropdown_open");
            $("#advertisersDropDownList").closest(".each_filter2").toggleClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
            $("#profileDropdown").hide();
            //fetchAdvertiser(search);
        };

        $(document).click(function(e){
            if(!$(e.target).closest('.each_filter2').length){
                $("#advertisersDropDownList").hide();
            }
        });


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
            getCreativesList(search);
        };

        $scope.highlightSearch = function (text, search) {
            return utils.highlightSearch(text, search);
        };

        $scope.advertiserData = advertiserModel.getBrand();

        $(function () {
            $("header").on('click', '#brandsDropdownDiv', function () {
                $('.brandsList_ul').scrollTop($(this).offset().top - 20 + 'px')
            });
        });

        var eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function (event, brand) {
            $scope.selectBrand2(brand);
        });

        $scope.$on('$destroy', function () {
            eventBrandChangedFromDashBoard();
        });
    });
}());
