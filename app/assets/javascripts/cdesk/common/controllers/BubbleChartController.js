(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService,bubbleChart, bubbleChartModel,brandsModel, constants) {

        console.log("bubble chart initialized");

        function getSpendData () {
            $scope.spendBusy = true ;

            bubbleChartModel.getBubbleChartData().then(function(result) {
                $scope.spendBusy = false ;
                if(bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true){
                    d3.select("#brands_svg").remove();
                    d3.select("#campaigns_svg").remove();
                    $("#data_not_available").show();
                 //   $scope.cleanScreenWidget();
                }else{
                    $("#data_not_available").hide();
                    //based on advertiser_filter value find if the data is for all brands or for one brand
                    if(brandsModel.getSelectedBrand().id == -1) { // for all brands
                        bubbleChart.updateBubbleChartData(result);
                    } else { // data is obtained for campaigns
                        var brand_data = (result != undefined && result['brands'] != undefined) ? result['brands'][0] : undefined;

                        if(brand_data == undefined){
                            $("#data_not_available").show();
                          //  bubbleChartModel.getbubbleWidgetData()['dataNotAvailable'] == true
                        } else {
                            var data = {
                                campaigns : (brand_data == undefined) ? {} : brand_data['campaigns']
                            };
                            bubbleChart.updatCampaignBubbleChartData(data);
                        }

                    }

                }
               // bubbleChart.updateBubbleChartData(result);
            });
        }

        getSpendData();

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            $("#data_not_available").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            bubbleChart.cleaningBubbleChart("brands");
            getSpendData();
        });

        $scope.$on(constants.BRAND_BUTTON_CLICKED, function(event, args) {
            $("#brands").show();
            $("#campaigns").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            // alert("catch the event in dashboard");
        });


    });
}());