/**
 * Created by richa on 11/02/15.
 */(function () {
    'use strict';
    commonModule.controller('ScreenChartController', function ($scope, loginModel, $cookieStore, $location, loginService, screenChartModel, constants, analytics) {


        $scope.dataFound = true;
        $scope.screenWidgetData = screenChartModel.getScreenWidgetData();

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            console.log("EVENT_BRAND_CHANGED");
            $scope.refresh();
        });

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function(event, args) {
            console.log("EVENT_STATUS_FILTER_CHANGED");
            $scope.refresh();
        });

        $scope.refresh = function(){
            console.log("refresh");
            $scope.cleanScreenWidget();
            screenChartModel.getScreenWidgetData()['chartData']={};
            $scope.getScreenAndFormatData();
        };

        $scope.formatDropdownChange = function(obj){
            if(!$scope.dataFound) {
                screenChartModel.setScreenWidgetFormat(obj);
                return;
            }
            if(obj == "Platforms") {
                $(".dashboard_screens_graph_holder").addClass("dashboard_screens_platform") ;
            } else {
                $(".dashboard_screens_graph_holder").removeClass("dashboard_screens_platform") ;
            }
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
            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetMetric(obj);
            analytics.track(loginModel.getUserRole(), 'screens_and_formats_widget', obj.toLowerCase() + '_metric_selected', loginModel.getLoginName());
            $scope.updateScreenChartData();
        };

        $scope.updateScreenChartData = function() {
            $(".DashBoradScreenWidget").show();
            $scope.screenData = screenChartModel.dataModifyForScreenChart(screenChartModel.getScreenWidgetData()['responseData']);
        };

        $scope.cleanScreenWidget = function(){
            d3.select(".barChart").remove();
            $(".DashBoradScreenWidget").hide();
        };

        $scope.getScreenAndFormatData = function() {
            console.log("getScreenAndFormatData");
            $scope.screenBusy = true ;
            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                $scope.dataFound = true;
                $(".DashBoradScreenWidget").show();
                $scope.updateScreenChartData();
            });
        };

        $scope.init = function(){
            console.log("init");
            $scope.screenBusy = true;
            //$scope.getScreenAndFormatData();
        };

        $scope.init();

    });
}());
