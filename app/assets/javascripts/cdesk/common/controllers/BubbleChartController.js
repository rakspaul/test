(function () {
    'use strict';
    commonModule.controller('bubbleChartController', function ($scope, loginModel, $cookieStore, $location, loginService,bubbleChart, bubbleChartModel) {

        $scope.backToBrands = function(){
            $("#brands").show();
            $("#campaigns").hide();
           bubbleChart.cleaningBubbleChart("campaigns");
            //$("#campaigns_svg").removeAll();
        };


        function getSpendData () {

            bubbleChartModel.getBubbleChartData().then(function(result) {
                console.log("inside then of controller to get result");
                console.log(result);
                //var sampleData =  '/assets/cdesk/tmp/sample.json';
                bubbleChart.updateBubbleChartData(result);
            });
        }
        getSpendData();

    });
}());