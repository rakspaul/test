(function () {
    'use strict';
    advertiserModule.controller('AdvertiserController', function ($scope,$routeParams, advertiserModel, workflowService,  advertiserService, utils, $rootScope, constants, loginModel, analytics) {

        var search = false;
        var searchCriteria = utils.typeaheadParams;
        $scope.textConstants = constants;
        function fetchAdvertisers(searchCriteria,search) { console.log(2);
            advertiserModel.getAdvertisers(function (advertisersData) {
                $scope.advertisers = advertisersData;
                console.log('advertiser data',advertisersData);
               // localStorage.setItem('selectedCampaign', JSON.stringify($scope.advertisers));


            }, searchCriteria, search);
        }

        function init() {
            if (loginModel.getUserId() != undefined) {
                searchCriteria.clientId = loginModel.getClientId();
                fetchAdvertisers(searchCriteria, search);
            }
        }

        init();

        $scope.selectAdvertiser = function (advertiser) {
            $("#advertiser_name_selected").text(advertiser.name);
            $('#advertisersDropdownNew').attr('placeholder', advertiser.name).val('');
            $scope.advertiserData.showAll = true;
            advertiserModel.setSelectedAdvertisers(advertiser);
            advertiserModel.callAdvertiserBroadcast(advertiser);
        };

        $scope.showAdvertisersDropDown = function () {
            $("#advertisersDropDownList").toggle();
            $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
            $("#advertisersDropDownList").closest(".each_filter").toggleClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
            $("#profileDropdown").hide();
        };

        $scope.disableShowAll = function () {
            $scope.advertiserData.showAll = false;
        };

        $scope.highlightSearch = function (text, search) {
            return utils.highlightSearch(text, search);
        };

        var eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD, function (event, advertiser) {
            console.log(1);
            $scope.selectAdvertiser(advertiser);
        });

        var accountChanged = $rootScope.$on(constants.ACCOUNT_CHANGED, function (event,clientId) {
            fetchAdvertisers({key: "", limit: 100, offset: 0, clientId: clientId},{key: "", limit: 100, offset: 0, clientId: clientId});
            var advertiser = advertiserModel.getAllAdvertiser();
            console.log('all adver',advertiser);
            advertiserModel.setSelectedAdvertisers(advertiser);
            /*var allBrands = brandsModel.getAllBrand();
            brandsModel.setSelectedBrand(brandsModel);*/
            advertiserModel.callAdvertiserBroadcast(advertiser);

        });

        $scope.advertiserData = advertiserModel.getAdvertiser();

        $(function () {
            $("header").on('click', '#brandsDropdownDiv', function () {
                $('.advertisersList_ul').scrollTop($(this).offset().top - 20 + 'px')
            });
        });
    });
}());
