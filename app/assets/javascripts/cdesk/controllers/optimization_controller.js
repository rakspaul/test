var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, dataService, utils, $http,dataTransferService,actionChart ) {


        $scope.init = function () {

            $scope.clicked = {};
            $scope.clicked.strategy = dataTransferService.getClickedStrategy();
            $scope.clicked.action = dataTransferService.getClickedAction();
            $scope.clicked.campaignName = dataTransferService.getClickedCampaignName();
            $scope.clicked.orderId = dataTransferService.getClickedCampaignId();

            $scope.reachUrl = '/campaigns#/campaigns/' + $scope.clicked.orderId;
            console.log("clicked strategy is ");
            console.log($scope.clicked.strategy);

            $scope.lineItemName = $scope.clicked.strategy.lineItemName;
            $scope.actions = $scope.clicked.strategy.action;

            $scope.loadCdbDataForStrategy();

        };

        $scope.orderByField = 'created_at';
        $scope.reverseSort = true;
        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };


        $scope.colorCoding = function (val1, val2, matricImpacted) {
            if (val1 == val2)
                return "";
            else if (matricImpacted === "CPC" || matricImpacted === "CPA" || matricImpacted === "CPM")
                return ((val1 - val2) > 0) ? 'negative_td' : 'positive_td';

            else
                return ((val1 - val2) > 0 ) ? 'positive_td' : 'negative_td';

        };

        $scope.formatMetric = function (val1, metricImpacted) {
            if (metricImpacted === "CPC" || metricImpacted === "CPA" || metricImpacted === "CPM")
                return '$' + val1;
            else if (metricImpacted === "Delivery (Impressions)")
                return val1.toLocaleString();

            else
                return val1;
        };

        $scope.loadCdbDataForStrategy = function () {

            dataService.getCdbChartData($scope.clicked.orderId, 'lifetime', 'strategies', $scope.clicked.strategy.lineitemId).then(function (result) {
                var lineData = [];
                if (result.status == "success" && !angular.isString(result.data)) {
                    if (!angular.isUndefined(dataTransferService.getClickedKpiType())) {
                        if (result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                                var kpiTypeLower = angular.lowercase(dataTransferService.getClickedKpiType());
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }
                            $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(dataTransferService.getClickedKpiValue()), dataTransferService.getClickedKpiType(), dataTransferService.getClickedActionItems());
                            console.log($scope.chartForStrategy);
                        }
                    }
                }
            });
        };

    });
}());
