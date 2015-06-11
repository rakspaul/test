/**
 * Created by richa on 11/02/15.
 */(function () {
    'use strict';
    commonModule.controller('screenChartController', function ($scope, loginModel, $cookieStore, $location, loginService, screenChart, screenChartModel, constants, analytics) {

        $scope.init = function(){
            $scope.screenBusy = true;
            getScreenAndFormatData();

        };

      $scope.dataFound = true;
        $scope.screenWidgetData = screenChartModel.getScreenWidgetData();
        console.log('sapna: screen widget data: ');
        console.log($scope.screenWidgetData);

        function getScreenAndFormatData () {
            $("#screens").show();
            $scope.screenBusy = true ;

            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                if(screenChartModel.getScreenWidgetData()['dataNotAvailable'] == true){
                    //$("#data_not_available_screen").show();
                    $scope.dataFound = false;
                    $scope.cleanScreenWidget();
                }else{
                  $scope.dataFound = true;
                    //$("#data_not_available_screen").hide();
                    screenChart.updateScreenChartData();
                }

            });
        };

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
            d3.select("#screen_svg").remove();
            //$("#data_not_available_screen").hide();
            screenChartModel.getScreenWidgetData()['chartData']={};
            getScreenAndFormatData();
        };

      $scope.$on('SCREEN_DATA_NOT_AVAILABLE', function() {
        $scope.dataFound = false;
      });



        $scope.cleanScreenWidget = function(){
            d3.select("#screen_svg").remove();
        };

        $scope.formatDropdownChange = function(obj){
          if(!$scope.dataFound) {
              screenChartModel.setScreenWidgetFormat(obj);
              return;
          }
            $("#screens").hide();
            d3.select("#screen_svg").remove();
            screenChartModel.setScreenWidgetFormat(obj);
            screenChartModel.getScreenWidgetData()['chartData']={};
            console.log('before analytics');
            analytics.track(loginModel.getUserRole(), 'screens_and_formats_widget', obj.toLowerCase() + '_selected', loginModel.getLoginName());
            console.log('am here');
            getScreenAndFormatData();
            console.log('sapna: screen widget data - in functin: ');
            console.log($scope.screenWidgetData);
        };

        $scope.metricDropdownChange = function(obj){
          if(!$scope.dataFound) {
              screenChartModel.setScreenWidgetMetric(obj);
              return;
          }
            d3.select("#screen_svg").remove();
            screenChartModel.setScreenWidgetMetric(obj);
            analytics.track(loginModel.getUserRole(), 'screens_and_formats_widget', obj.toLowerCase() + '_metric_selected', loginModel.getLoginName());
            screenChart.updateScreenChartData();
        };

        $scope.init();

    });
}());