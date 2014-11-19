var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, $location, $anchorScroll, dataService, utils, $http,dataTransferService,actionChart, $timeout, inventoryService, domainReports) {

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

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

            $scope.campaignlist();
            $scope.loadTableData();
            $scope.loadCdbDataForStrategy();
        };


        $scope.filters = domainReports.getReportsDropDowns();
        $scope.orderByField = 'created_at';
        $scope.reverseSort = true;
        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };


        $scope.campaignSelected = function(id) {
            var myContainer = $('.reports_section_details_container');//$('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            if(scrollTo.length) {
                myContainer.find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + this.id).addClass('action_selected');
                myContainer.animate({
                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                });
            }
            localStorage.removeItem('actionSel');
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
                            tacticList[i].actionList = [];
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
            var action = dataTransferService.getClickedAction();
            var actionId = action.ad_id+''+action.id;
            if(actionId !== null) {
                $timeout(function() {
                    $scope.campaignSelected(actionId);
                }, 1000);
            }

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

        $scope.goToGraph = function(id) {
            $("html,body").animate ( {scrollTop:0}, '300');
        };

        $scope.showSelected = function(id){
            //$('#action-container:first').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+id).addClass('action_selected');
            $('.reports_section_details_container').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+id).addClass('action_selected');

            $('circle').attr({stroke: 'grey', fill:'#ffffff'});
            $('circle#' +id).attr({stroke: 'green', fill:'green'});
            //localStorage.setItem('actionSel' , 'actionItem_'+id);
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

        $scope.chartForStrategy=true;
        $scope.loadCdbDataForStrategy = function () {
            //var brandDuration = (dataTransferService.getBrandDuration() !== undefined) ? dataTransferService.getBrandDuration() :  'lifetime';

            dataService.getCdbChartData({ orderId: $scope.clicked.orderId}, 'lifetime'/*brandDuration*/, 'strategies', $scope.clicked.strategy.lineitemId, true).then(function (result) {
                var lineData = [];
                if (result.status == "success" && !angular.isString(result.data)) {
                    if (!angular.isUndefined(dataTransferService.getClickedKpiType())) {
                        if (result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                                var kpiTypeLower = angular.lowercase(dataTransferService.getClickedKpiType());
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }
                            $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(dataTransferService.getClickedKpiValue()), dataTransferService.getClickedKpiType(), dataTransferService.getClickedActionItems(), 990, 250, true, $scope.clicked);
                           // console.log($scope.chartForStrategy);
                        }
                    }else{
                        $scope.chartForStrategy=false;
                    }
                }else{
                    $scope.chartForStrategy=false;
                }
            });
        };

        $scope.showIcon = function (id) {
            $scope.iconIdToShow = id;
        };
        $scope.hideIcon = function (id) {
            $scope.iconIdToShow = -1;
        };


        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.setCampaignStrategyList = function(campaigns){
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign.id =  dataTransferService.getClickedCampaignId() ? dataTransferService.getClickedCampaignId() : $scope.campaingns[0].campaign_id;
                $scope.selectedCampaign.name = dataTransferService.getClickedCampaignName() ? dataTransferService.getClickedCampaignName() :  $scope.campaingns[0].name;
            }
            else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign.id = -1;
                    $scope.selectedCampaign.name = "No Campaign Found";
                }
            }

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {
                    var campaigns = result.data.data.slice(0, 1000);
                    dataTransferService.setCampaignList('campaignList', campaigns);
                    $scope.setCampaignStrategyList(campaigns);
                });
            }else{
                $scope.setCampaignStrategyList(domainReports.getCampaignListForUser());
            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            inventoryService.getStrategiesForCampaign(campaignId).then(function (result) {
                $scope.strategies = result.data.data;
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    if(dataTransferService.getDomainReportsValue('previousCampaignId') !== dataTransferService.getDomainReportsValue('campaignId')) {
                        $scope.selectedStrategy.id = $scope.strategies[0].id;
                        $scope.selectedStrategy.name = $scope.strategies[0].name;
                    }else {
                        $scope.selectedStrategy.id =  dataTransferService.getClickedStrategyId() ? dataTransferService.getClickedStrategyId() : $scope.strategies[0].id;
                        $scope.selectedStrategy.name = dataTransferService.getClickedStrategyName() ? dataTransferService.getClickedStrategyName() : $scope.strategies[0].name;
                    }
                    //Call the chart to load with the changed campaign id and strategyid
                    $scope.chartForStrategy=true;
                    $scope.loadCdbDataForStrategy()
                }
                else { //  means empty strategy list
                    $scope.selectedStrategy.id = -1;
                    $scope.selectedStrategy.name = "No Strategy Found";
                    $scope.chartForStrategy=false;
                }
            });
        };

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            dataTransferService.updateExistingStorageObjects({'campaignId' : id, 'campaignName' :  txt, 'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId')});
            $scope.$apply();

            if($scope.selectedCampaign.id !== -1) {
                $scope.chartForStrategy=true;
                $scope.strategylist($scope.selectedCampaign.id);
            }
            else{
                $scope.chartForStrategy=false;
                $scope.selectedStrategy.id= -1;
                $scope.selectedStrategy.name = "No Strategy Found";
            }

        });




        //Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {

            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                var id = $(e.target).attr('value'), txt = $(e.target).text();
                $scope.selectedStrategy.id =id;
                $scope.selectedStrategy.name = txt;
                dataTransferService.updateExistingStorageObjects({'strategyId' : id, 'strategyName' :  txt});
                $scope.$apply();
                $scope.chartForStrategy=true;
                $scope.loadCdbDataForStrategy();
            }
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());