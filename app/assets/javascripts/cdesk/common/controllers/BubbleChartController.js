(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService, bubbleChart, bubbleChartModel, brandsModel, constants) {

         $scope.data = {
             brandData : {},
             campaignDataForSelectedBrand : {},
             campaignDataForAllBrands : {}
         };
        function getSpendDataForCampaigns() {
            $scope.spendBusy = true;

            // Fetch the new data now.
            bubbleChartModel.getBubbleChartDataForCampaign().then(function () {
                $scope.spendBusy = false;
                if (bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true) {
                    d3.select("#brands_svg").remove();
                    d3.select("#campaigns_svg").remove();
                    $("#data_not_available").show();

                } else {
                    $("#data_not_available").hide();
                    $scope.data.campaignDataForSelectedBrand = bubbleChartModel.getbubbleWidgetData()['campaignDataForSelectedBrand'] ;
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'] ;

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
                    $("#data_not_available").show();

                } else {
                    $("#data_not_available").hide();
                    $scope.data.brandData = bubbleChartModel.getbubbleWidgetData()['brandData'] ;
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'] ;

                    bubbleChart.updateBubbleChartData( "brands", $scope.data.brandData);

                }

            });
        }

        getSpendDataForBrands();

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            bubbleChart.cleaningBubbleChart("brands");
            bubbleChart.cleaningBubbleChart("campaigns");
            if(brandsModel.getSelectedBrand().id == -1)// All brands is selected
                getSpendDataForBrands()
            else
               getSpendDataForCampaigns();
        });

    });
}());