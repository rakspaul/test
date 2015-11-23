(function () {
    'use strict';
    brandsModule.controller('BrandsController', function ($scope, brandsModel,workflowService, brandsService, utils,$routeParams, $rootScope, constants, loginModel, analytics) {


        var brand = {};
        brand.allBrandObject = {id: -1, name: constants.ALL_BRANDS};
        brand.selectedBrand = brand.allBrandObject;
        brand.showList = false;
        brand.styleDisplay = "block";
        brand.showAll = true;
        brand.enable = true;
        brand.cssClass = "";
        var brands = [brand.allBrandObject];

        $scope.campaignId = $routeParams.campaignId;
        //alert(JSON.stringify($routeParams));
        //alert($scope.selectedCampaign.id);
        //CampaignId: $scope.selectedCampaign.id

        var search = false;

        var searchCriteria = utils.typeaheadParams;

        $scope.textConstants = constants;

        $scope.newBrandId ="";


        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during immediate scroll down.
        $scope.fetching = false;

        function resetSearch() {
            searchCriteria.limit = constants.DEFAULT_LIMIT_COUNT;
            searchCriteria.offset = constants.DEFAULT_OFFSET_START;
            $scope.exhausted = false;
        }

        /*old*/
        /**/

        function fetchBrands(search,theID) {
            //alert(theID);

            //$scope.newBrandId = theID;
            //theID = $scope.newBrandId;

            brandsModel.getBrands(function (brandsData,newIdImPassing) {
                //alert("the id im passing    "+newIdImPassing);

                //data manipulation was already done in brandsModel, so just need to attach data to scope here
                //alert(brandsData.id +"  --  "+ searchCriteria.limit);
                if (brandsData.length < searchCriteria.limit)

                    $scope.exhausted = true;
                $scope.fetching = false;
                $scope.brands = brandsData;
                //$scope.advertiser3 = brandsData;
            }, searchCriteria, search,theID);
        }
        /**/
        /**/

        /* this is new */
        /**/
        var adverIDD = "3";
        var brands2;
       // var advertiserId = $scope.selectedCampaign.id;
        function getCreativesList (adverIDD,brand)  {
            if(adverIDD  !== "3"){
                adverIDD = "3";
            }

            workflowService.getBrands(adverIDD,brand).then(function (result) {
                //alert(result.status);
                //alert(JSON.stringify(result));
                if (result.status === "OK" || result.status === "success" && result.data.data.length > 0) {
                    $scope.exhausted = true;
                    $scope.fetching = false;



                    var resData = result.data.data;
                    brands = [];
                    brands.push(brand.allBrandObject);


                    brands = brands.concat(resData);



                    //$scope.brands = result;
                    $scope.advertiser3 = brands;
                    // alert(JSON.stringify($scope.advertiser3));
                } else {

                    //creativeList.errorHandler()
                }
            });
        };

        function errorHandler () {
            $scope.creativesNotFound = true;
            $scope.creativeListLoading = false;
            $scope.creativeData['creatives'] = [];
            $scope.creativeData['creatives_count'] = 0;
        };
        //getCreativesList(adverIDD);
        /**/
        /**/

        if (loginModel.getUserId() != undefined)
            fetchBrands(searchCriteria, search);

        $scope.loadMoreBrands = function () {
            searchCriteria.offset += searchCriteria.limit;
            searchCriteria.key = $("#brandsDropdown").val();
            search = false;
            $scope.fetching = true;
            fetchBrands(search);
        };


        $scope.selectBrand = function (brand) {
            $("#brand_name_selected").text(brand.name);
            $('#brandsDropdown').attr('placeholder', brand.name).val('');
            $scope.brandData.showAll = true;
            brandsModel.setSelectedBrand(brand);
            brandsModel.callBrandBroadcast(brand);
            analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
        };


        $scope.brandsDropdownClicked = function () {
/*            if (brandsModel.getBrand().enable === false) {
                return;
            }*/
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
            //resetSearch();
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

        var eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function (event, brand) {
            $scope.selectBrand(brand);
        });


        $rootScope.$on(constants.EVENT_BRAND_CHANGED, function(event,brand) {// pass the advertiser value here

            if(brand !== undefined){
                $scope.newBrandId = brand;
                var adverIDD = "3";
                // going to set wht brand the api call is based on here
                //alert(brand);
                //alert(event);
                getCreativesList(adverIDD,brand);

            }


        });



        $scope.$on('$destroy', function () {
            eventBrandChangedFromDashBoard();
        });
    });
}());
