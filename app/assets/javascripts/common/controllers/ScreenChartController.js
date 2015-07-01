/**
 * Created by richa on 11/02/15.
 */(function () {
    'use strict';
    commonModule.controller('screenChartController', function ($scope, loginModel, $cookieStore, $location, loginService, screenChartModel, constants, analytics) {


        $scope.dataFound = true;
        $scope.screenWidgetData = screenChartModel.getScreenWidgetData();

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            $scope.refresh();
        });

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function(event, args) {
            $scope.refresh();
        });


        $scope.refresh = function(){
            $scope.cleanScreenWidget();
            screenChartModel.getScreenWidgetData()['responseData']={};
            $scope.getScreenAndFormatData();
        };

        $scope.$on('SCREEN_DATA_NOT_AVAILABLE', function() {
            $scope.dataFound = false;
        });


        $scope.formatDropdownChange = function(obj){
            /*if(!$scope.dataFound) {
                screenChartModel.setScreenWidgetFormat(obj);
                return;
            }*/
            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetFormat(obj);
            screenChartModel.getScreenWidgetData()['chartData']={};
            analytics.track(loginModel.getUserRole(), 'screens_and_formats_widget', obj.toLowerCase() + '_selected', loginModel.getLoginName());
            $scope.getScreenAndFormatData();
        };

        $scope.metricDropdownChange = function(obj){
            if(!$scope.dataFound) {
                screenChartModel.setScreenWidgetMetric(obj);
                return;
            }
            screenChartModel.setScreenWidgetMetric(obj);
            analytics.track(loginModel.getUserRole(), 'screens_and_formats_widget', obj.toLowerCase() + '_metric_selected', loginModel.getLoginName());
            $scope.updateScreenChartData();
        };

        $scope.updateScreenChartData = function() {
            $scope.cleanScreenWidget();
            $scope.screenData = screenChartModel.dataModifyForScreenChart(screenChartModel.getScreenWidgetData()['responseData']);
            console.log($scope.screenData);
        };


        $scope.cleanScreenWidget = function(){
            d3.select(".chart").remove()
        };

        $scope.getScreenAndFormatData = function() {
            $scope.screenBusy = true ;
            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                if(screenChartModel.getScreenWidgetData()['dataNotAvailable'] == true){
                    $scope.dataFound = false;
                    $scope.cleanScreenWidget();
                } else{
                    $scope.dataFound = true;
                    $scope.updateScreenChartData();
                }
            });
        };

        $scope.init = function(){
            $scope.screenBusy = true;
            $scope.getScreenAndFormatData();
        };

        $scope.init();

    });
}());