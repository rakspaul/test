(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService, bubbleChart, bubbleChartModel, brandsModel, constants) {


        function getSpendData() {
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
                    var result = bubbleChartModel.getbubbleWidgetData()['chartData'] ;
                    $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData()['budget_top_title'] ;

                    //based on advertiser_filter value find if the data is for all brands or for one brand
                    if (brandsModel.getSelectedBrand().id == -1) { // for all brands
                        bubbleChart.updateBubbleChartData(result);

                    } else { // data is obtained for campaigns
                        var brand_data = (result != undefined && result['brands'] != undefined) ? result['brands'][0] : undefined;

                        if (brand_data == undefined) {
                            $("#data_not_available").show();
                            bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true
                        } else {
                            var data = {
                                campaigns: (brand_data == undefined) ? {} : brand_data['campaigns']
                            };
                            bubbleChart.updatCampaignBubbleChartData(data);
                        }

                    }

                }

            });
        }

        getSpendData();

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            bubbleChart.cleaningBubbleChart("brands");
            bubbleChart.cleaningBubbleChart("campaigns");

            getSpendData();
        });

//        $scope.$on(constants.BRAND_BUTTON_CLICKED, function (event, args) {
//            console.log("brand button clicked");
//            bubbleChart.cleaningBubbleChart("campaigns");
//            bubbleChart.cleaningBubbleChart("brands");
//            $("#brands").show();
//            $("#campaigns").hide();
//            // alert("catch the event in dashboard");
//            // first clean the old data
//          //  bubbleChartModel.getbubbleWidgetData()['chartData'] = {};
//        });


    });
}());