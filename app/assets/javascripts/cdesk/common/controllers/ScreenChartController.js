/**
 * Created by richa on 11/02/15.
 */(function () {
    'use strict';
    commonModule.controller('screenChartController', function ($scope, loginModel, $cookieStore, $location, loginService, screenChart, screenChartModel, constants) {

        $scope.init = function(){
            $scope.screenBusy = true;
            getScreenAndFormatData();

        };

        $scope.screenWidgetData = screenChartModel.getScreenWidgetData();

        function getScreenAndFormatData () {
            $("#screens").show();
            $scope.screenBusy = true ;

            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                if(screenChartModel.getScreenWidgetData()['dataNotAvailable'] == true){
                    $("#data_not_available_screen").show();
                    $scope.cleanScreenWidget();
                }else{
                    $("#data_not_available_screen").hide();
                    screenChart.updateScreenChartData();
                }

            });
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            d3.select("#screen_svg").remove();
            $("#data_not_available_screen").hide();
            screenChartModel.getScreenWidgetData()['chartData']={};
            getScreenAndFormatData();
        });



        $scope.cleanScreenWidget = function(){
            d3.select("#screen_svg").remove();
        };

        $scope.formatDropdownChange = function(obj){
            $("#screens").hide();
            d3.select("#screen_svg").remove();
            screenChartModel.setScreenWidgetFormat(obj);
            screenChartModel.getScreenWidgetData()['chartData']={};
            getScreenAndFormatData();
        };

        $scope.metricDropdownChange = function(obj){
            d3.select("#screen_svg").remove();
            screenChartModel.setScreenWidgetMetric(obj);

            screenChart.updateScreenChartData();
        };

        $scope.init();

    });
}());