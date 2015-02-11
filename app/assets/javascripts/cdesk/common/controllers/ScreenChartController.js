/**
 * Created by richa on 11/02/15.
 */(function () {
    'use strict';
    commonModule.controller('screenChartController', function ($scope, loginModel, $cookieStore, $location, loginService, screenChart, screenChartModel, constants) {

        $scope.init = function(){
            $scope.screenBusy = true;
            getScreenAndFormatData();

        };

        function getScreenAndFormatData () {
            $scope.screenBusy = true ;

            screenChartModel.getScreenChartData().then(function(result) {
                $scope.screenBusy = false ;
                console.log("screen chart controller =-> getScreenAndFormatData ");
                screenChart.updateScreenChartData(result);
            });
        }

        $scope.init();

    });
}());