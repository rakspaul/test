(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService,bubbleChart, bubbleChartModel,constants) {

        $scope.init = function(){
            $scope.spendBusy = true;
            getSpendData();

        };

        function getSpendData () {
            $scope.spendBusy = true ;

            bubbleChartModel.getBubbleChartData().then(function(result) {
                $scope.spendBusy = false ;
                bubbleChart.updateBubbleChartData(result);
            });
        }

        $scope.init();

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            $("#data_not_available").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            bubbleChart.cleaningBubbleChart("brands");
            getSpendData();
        });

        $scope.$on(constants.BRAND_BUTTON_CLICKED, function(event, args) {
            $("#brands").show();
            $("#campaigns").hide();
            $("#backToBrands").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            // alert("catch the event in dashboard");
        });

        $scope.backToBrands = function(){
            $("#brands").show();
            $("#campaigns").hide();
            $("#backToBrands").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            //$("#campaigns_svg").removeAll();
        };


    });
}());