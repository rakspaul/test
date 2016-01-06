(function () {
    'use strict';
    commonModule.controller('BubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService, bubbleChart, bubbleChartModel, brandsModel, constants) {

        $scope.data = {
            brandData: {},
            campaignDataForSelectedBrand: {},
            campaignDataForAllBrands: []
        };
        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;
        function getSpendDataForCampaigns() {
            $scope.spendBusy = true;

            // Fetch the new data now.
            bubbleChartModel.getBubbleChartDataForCampaign(brandsModel.getSelectedBrand().id).then(function () {
                $scope.spendBusy = false;
                if (bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true) {
                    d3.select("#brands_svg").remove();
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

        function getSpendDataForBrands() {
            $scope.spendBusy = true;

            // Fetch the new data now.
            bubbleChartModel.getBubbleChartData().then(function () {
                $scope.spendBusy = false;
                if (bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true) {
                    d3.select("#brands_svg").remove();
                    d3.select("#campaigns_svg").remove();
                    $scope.dataFound = false;

                } else {
                    $scope.dataFound = true;
                    // $("#data_not_available").hide();
                    $scope.data.brandData = bubbleChartModel.getbubbleWidgetData()['brandData'];
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'];

                    bubbleChart.updateBubbleChartData("brands", $scope.data.brandData);

                    for (var i in $scope.data.brandData) {
                        var brand = $scope.data.brandData[i];

                        bubbleChartModel.getBubbleChartDataForCampaignWithOutCanceller(brand.id).then(function (result) {
                            var obj = {
                                brandId: brand.id,
                                campaigns: result
                            };
                            $scope.data.campaignDataForAllBrands.push(obj);
                        });
                    }
                }

            });
        }

        if (brandsModel.getSelectedBrand().id == -1)
            getSpendDataForBrands();
        else
            getSpendDataForCampaigns();

        $scope.refresh = function () {
            bubbleChart.cleaningBubbleChart("brands");
            bubbleChart.cleaningBubbleChart("campaigns");
            if (brandsModel.getSelectedBrand().id == -1)// All brands is selected
                getSpendDataForBrands()
            else
                getSpendDataForCampaigns();
        };

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function (event, args) {
            $scope.refresh();
        });

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            $scope.refresh();
        });


        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

    });
}());