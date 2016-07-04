define(['angularAMD',
    'login/login_model','login/login_service','reporting/common/d3/bubble_chart',
    'reporting/models/bubble_chart_model','reporting/brands/brands_model','common/services/constants_service',
    'reporting/advertiser/advertiser_model'],function (angularAMD) {
    'use strict';
    angularAMD.controller('BubbleChartController', function ($scope, $cookieStore, $location,
        loginModel, loginService, bubbleChart,
        bubbleChartModel, brandsModel, constants,
        advertiserModel) {

        var _curCtrl = this;
        _curCtrl.defaultFilter = {advertiserId: -1, brandId: -1, dateFilter: "life_time"}
        $scope.data = {
            advertiserData: {},
            campaignDataForSelectedBrand: {},
            campaignDataForAllBrands: []
        };
        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;
        function getSpendDataForCampaigns() {
            $scope.spendBusy = true;

            // Fetch the new data now.
            bubbleChartModel.getBubbleChartDataForCampaign().then(function () {
                $scope.spendBusy = false;
                if (bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true) {
                    d3.select("#advertisers_svg").remove();
                    d3.select("#campaigns_svg").remove();
                    $scope.dataFound = false;
                } else {
                    $scope.dataFound = true;
                    $scope.data.campaignDataForSelectedBrand = bubbleChartModel.getbubbleWidgetData()['campaignDataForSelectedBrand'];
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'];

                    bubbleChart.updateBubbleChartData("campaigns", $scope.data.campaignDataForSelectedBrand);

                }

            });
        }

        function getSpendDataForAdvertisers() {
            var o = {};
            o.advertiserId = advertiserModel.getSelectedAdvertiser().id;
            o.brandId = brandsModel.getSelectedBrand().id;
            o.dateFilter = constants.PERIOD_LIFE_TIME;

            (JSON.stringify(o) == JSON.stringify(_curCtrl.defaultFilter)) ? getSpendDataForAdvertisersWithDefaultValue() : getSpendDataForCampaigns(o);
            $scope.spendBusy = true;
        }

        function getSpendDataForAdvertisersWithDefaultValue(){
            // Fetch the new data now.
            bubbleChartModel.getBubbleChartData().then(function () {
                $scope.spendBusy = false;
                if (bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true) {
                    d3.select("#advertisers_svg").remove();
                    d3.select("#campaigns_svg").remove();
                    $scope.dataFound = false;

                } else {
                    $scope.dataFound = true;
                    // $("#data_not_available").hide();
                    $scope.data.advertiserData = bubbleChartModel.getbubbleWidgetData()['advertiserData'];
                    bubbleChart.updateBubbleChartData("advertisers", $scope.data.advertiserData);
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'];

                }

            },function(err){
                dataNotFound();
            });
        }
        function dataNotFound(){
            $scope.spendBusy = false;
            d3.select("#advertisers_svg").remove();
            d3.select("#campaigns_svg").remove();
            $scope.dataFound = false;
        }
        if (advertiserModel.getSelectedAdvertiser().id == -1)
            getSpendDataForAdvertisers();
        else
            getSpendDataForCampaigns();

        $scope.refresh = function () {

            bubbleChart.cleaningBubbleChart("advertisers");
            bubbleChart.cleaningBubbleChart("campaigns");
            if (advertiserModel.getSelectedAdvertiser().id == -1)// All Advertisers is selected
                getSpendDataForAdvertisers();
            else
                getSpendDataForCampaigns();
        };

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function (event, args) {
            $scope.refresh();
        });

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            $scope.refresh();
        });

        /*$scope.$on(constants.EVENT_SUB_ACCOUNT_CHANGED, function (event, args) {
          $scope.refresh();
        });*/


        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

    });
});