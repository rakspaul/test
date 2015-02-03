(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService,bubbleChart, bubbleChartModel) {

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

        $scope.backToBrands = function(){
            $("#brands").show();
            $("#campaigns").hide();
            bubbleChart.cleaningBubbleChart("campaigns");
            //$("#campaigns_svg").removeAll();
        };


    });
}());