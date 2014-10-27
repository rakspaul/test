var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, $location, $anchorScroll, dataService, utils, $http,dataTransferService,actionChart) {

       var tactics = new Array();
        $scope.init = function () {
            //To set the active tab for reports

            $scope.clicked = {};
            $scope.clicked.strategy = dataTransferService.getClickedStrategy();
            $scope.clicked.action = dataTransferService.getClickedAction();
            $scope.clicked.campaignName = dataTransferService.getClickedCampaignName();
            $scope.clicked.orderId = dataTransferService.getClickedCampaignId();

            $scope.reachUrl = '/campaigns#/campaigns/' + $scope.clicked.orderId;
            $scope.lineItemName = $scope.clicked.strategy.lineItemName;

           $scope.loadTableData();

            $scope.loadCdbDataForStrategy();
        };



        $scope.orderByField = 'created_at';
        $scope.reverseSort = true;
        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };

        $scope.loadTableData = function(){
            var tacticList = [];
            var actionItems = $scope.clicked.strategy.action;

            for(var index in actionItems) {
                var tactic_id = actionItems[index].ad_id;
                var grouped = false;
                if (tacticList.length > 0) {

                    for (var i in tacticList) {
                        if (tactic_id === tacticList[i].ad_id) {
                            grouped = true;
                            tacticList[i].actionList.push(actionItems[index]);
                            break;
                        }
                    }
                    if (!grouped) {
                        var tactic = {};
                        tactic.ad_id = actionItems[index].ad_id;
                        tactic.ad_name = actionItems[index].ad_name;
                        tactic.actionList = [];
                        tactic.actionList.push(actionItems[index]);
                        tacticList.push(tactic);
                    }
                }
                else {
                    var tactic = {};
                    tactic.ad_id = actionItems[index].ad_id;
                    tactic.ad_name = actionItems[index].ad_name;
                    tactic.actionList = [];
                    tactic.actionList.push(actionItems[index]);

                    tacticList.push(tactic);

                }
            }
            $scope.tacticList = tacticList ;

        };


        $scope.colorCoding = function (val1, val2, matricImpacted) {
            if (val1 == val2)
                return "";
            else if (matricImpacted === "CPC" || matricImpacted === "CPA" || matricImpacted === "CPM")
                return ((val1 - val2) > 0) ? 'negative_td' : 'positive_td';

            else
                return ((val1 - val2) > 0 ) ? 'positive_td' : 'negative_td';

        };


        $scope.roundOff = function(value,places) {
            var factor = Math.pow(10,places);
            var rounded= Math.round(value*factor)/factor;
            return Math.abs(rounded);
        };

        $scope.goToGraph = function() {
            $location.hash('graph');
            $anchorScroll;
        };


        $scope.formatMetric = function (val1, metricImpacted) {


            if (metricImpacted === "CPC" || metricImpacted === "CPA" || metricImpacted === "CPM")
                return '$' + val1;
            else if (metricImpacted === "Delivery (Impressions)") {

                return val1.toLocaleString();
            }

            else
                return val1;
        };

        $scope.campaignSelected = function(id) {
            var myContainer = $('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
            myContainer.animate({
                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
            });
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
                            $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(dataTransferService.getClickedKpiValue()), dataTransferService.getClickedKpiType(), dataTransferService.getClickedActionItems(), 1000, 250);
                           // console.log($scope.chartForStrategy);
                        }
                    }
                    var action = dataTransferService.getClickedAction();
                    var actionId = action.ad_id+''+action.id;
                    console.log($location.path());
                    if(actionId !== null) {
                        $scope.campaignSelected(actionId);
                    }
                }
            });
        };
        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:last').addClass('active');
    });
}());
