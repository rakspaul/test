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
            $scope.screenBusy = true ;

            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                screenChart.updateScreenChartData();
            });
        }

        $scope.cleanScreenWidget = function(){
            d3.select("#screen_svg").remove();
        };

        $scope.formatDropdownChange = function(obj){
            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetFormat(obj);
            getScreenAndFormatData();
        };

        $scope.metricDropdownChange = function(obj){
            console.log(obj);
            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetMetric(obj);

            screenChart.updateScreenChartData();
        };

        $scope.init();

    });
}());