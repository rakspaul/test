define(['angularAMD','screen-chart-model'], function (angularAMD) {
    'use strict';

    angularAMD.controller('ScreenChartController', ['$scope', 'loginModel', 'screenChartModel', 'constants',
        function ($scope, loginModel, screenChartModel, constants) {

        $scope.dataFound = true;
        $scope.screenWidgetData = screenChartModel.getScreenWidgetData();
        $scope.screenBusy = false;

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function () {
            if (!$scope.screenBusy) {
                $scope.refresh();
            }
        });

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function () {
            $scope.refresh();
        });

        $scope.refresh = function () {
            $scope.cleanScreenWidget();
            screenChartModel.getScreenWidgetData().chartData = {};
            $scope.getScreenAndFormatData();
        };

        $scope.formatDropdownChange = function (obj) {
            if (!$scope.dataFound) {
                screenChartModel.setScreenWidgetFormat(obj);
                return;
            }

            if (obj === 'Platforms') {
                $('.dashboard_screens_graph_holder').addClass('dashboard_screens_platform');
            } else {
                $('.dashboard_screens_graph_holder').removeClass('dashboard_screens_platform');
            }

            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetFormat(obj);
            screenChartModel.getScreenWidgetData().chartData = {};
            $scope.getScreenAndFormatData();
        };

        $scope.metricDropdownChange = function (obj) {
            if (!$scope.dataFound) {
                screenChartModel.setScreenWidgetMetric(obj);
                return;
            }

            $scope.cleanScreenWidget();
            screenChartModel.setScreenWidgetMetric(obj);
            $scope.updateScreenChartData();
        };

        $scope.updateScreenChartData = function () {
            $('.DashBoradScreenWidget').show();

            $scope.screenData =
                screenChartModel.dataModifyForScreenChart(screenChartModel.getScreenWidgetData().responseData);
        };

        $scope.cleanScreenWidget = function () {
            d3.select('.barChart').remove();
            $('.DashBoradScreenWidget').hide();
        };

        $scope.getScreenAndFormatData = function () {
            $scope.screenBusy = true;

            screenChartModel
                .getScreenChartData()
                .then(function () {
                    $scope.screenBusy = false;
                    $scope.dataFound = true;
                    $('.DashBoradScreenWidget').show();
                    $scope.updateScreenChartData();
                });
        };

        $scope.init = function () {
            $scope.getScreenAndFormatData();
        };

        $scope.init();
    }]);
});
