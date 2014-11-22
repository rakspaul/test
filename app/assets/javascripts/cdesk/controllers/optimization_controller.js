var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, $location, $anchorScroll, dataService, utils, $http,dataTransferService,actionChart, $timeout, inventoryService, domainReports, apiPaths, actionColors, campaign) {

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        var tactics = new Array();
        $scope.clicked = {
            action:{},
            strategy : {
                action: {}
            },
            campaignName : {},
            orderId : {}
        };

        $scope.filters = domainReports.getReportsDropDowns();
        $scope.orderByField = 'created_at';
        $scope.reverseSort = true;
        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };

        $scope.actionListForSelectedStrategy = function() {
            //You have opened as a new page.

            var actionUrl = apiPaths.apiSerivicesUrl + "/reports/campaigns/" + $scope.selectedCampaign.id + "/actions?user_id="+user_id;

            dataService.getActionItems(actionUrl).then(function(result) {

                if(result.data.status_code !== 404) {
                    var counter = 0;
                    var actionItems = result.data.data;

                    var actionItemsArray=[];

                    if (actionItems.length > 0 && $scope.selectedCampaign.id != -1 && $scope.selectedStrategy.id != -1) {

                        for(var i=0; i<actionItems.length; i++) {
                            if (actionItems[i].lineitemId == $scope.selectedStrategy.id) {
                                for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                                    actionItems[i].action[j].action_color = actionColors[counter % 9];
                                    $scope.clicked.strategy.action = actionItems[i].action;
                                    actionItemsArray.push(actionItems[i].action[j]);
                                    counter++;
                                }
                            }
                        }
                        $scope.clicked.orderId = $scope.selectedCampaign.id;
                        $scope.clicked.campaignName = $scope.selectedCampaign.name;
                        $scope.clicked.strategy.lineitemId = $scope.selectedStrategy.id;

                        $scope.actionItems = actionItemsArray;

                        $scope.reachUrl = '/campaigns#/campaigns/' + $scope.clicked.orderId;
                        $scope.lineItemName = $scope.clicked.action.lineItemName;
                        if(actionItemsArray.length > 0) {
                            $scope.loadCdbDataForStrategy();
                            $scope.loadTableData();
                            $scope.tacticNotFound = false;
                        }else{
                            $scope.tacticNotFound = true;
                            $scope.chartForStrategy = false;
                        }

                    }else{
                        $scope.tacticNotFound = true;
                    }
                }else{
                    $scope.tacticNotFound = true;
                    //DATA NOT AVAIBLE div
                }
            }, function(result) {
                $scope.tacticNotFound = true;
                console.log('call failed');
            });
        };

        $scope.getCampaignDetails = function() {
            //API call for campaign details
            var url = "/campaigns/" +$scope.selectedCampaign.id + ".json?filter[date_filter]=life_time";
            //console.log('URL : '+url);
            dataService.getSingleCampaign(url).then(function(result) {
                if (result.data !== undefined) {

                    $scope.campaign = {
                        id: result.data.id,
                        start_date : result.data.start_date,
                        end_date : result.data.end_date,
                        kpi_type :  result.data.kpi_type,
                        kpi_value :  result.data.kpi_value

                        };
                }
                $scope.actionListForSelectedStrategy();
            }, function(result) {
                console.log('call failed');
            });
        };

        $scope.init = function () {
            //To set the active tab for reports
            $scope.campaignlist();  //First load the campaign List
            if(dataTransferService.getClickedStrategy()  !== undefined) {
                $scope.clicked.strategy = dataTransferService.getClickedStrategy();
                $scope.clicked.action = dataTransferService.getClickedAction();
                $scope.clicked.campaignName = dataTransferService.getClickedCampaignName();
                $scope.clicked.orderId = dataTransferService.getClickedCampaignId();

                $scope.reachUrl = '/campaigns#/campaigns/' + $scope.clicked.orderId;
                $scope.lineItemName = $scope.clicked.strategy.lineItemName;

                $scope.loadTableData();
                $scope.loadCdbDataForStrategy();
            }
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
            var action = (dataTransferService.getClickedAction() !== undefined ) ? dataTransferService.getClickedAction() : actionItems[0];
            $scope.orderid = action.ad_id + '' + action.id;
            if(action) {
                if ($scope.orderid !== null) {
                    $timeout(function () {
                        $scope.campaignSelected($scope.orderid);
                    },7000);
                }
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

            if($scope.campaign !== undefined) {
                var  param = { orderId: parseInt($scope.selectedCampaign.id), startDate:$scope.campaign.start_date, endDate: $scope.campaign.end_date};
                var strategyId = $scope.selectedStrategy.id;
            } else {

                var  param = { orderId: parseInt($scope.clicked.orderId)}
                var strategyId = $scope.clicked.strategy.lineitemId;
            }

            dataService.getCdbChartData(param, 'lifetime'/*brandDuration*/, 'strategies', strategyId, true).then(function (result) {

                var lineData = [];
                if (result.status == "success" && !angular.isString(result.data)) {
                    var kpiType = dataTransferService.getClickedKpiType() ? dataTransferService.getClickedKpiType() : $scope.campaign.kpi_type;
                    var kpiValue = dataTransferService.getClickedKpiValue() ? dataTransferService.getClickedKpiValue() : $scope.campaign.kpi_value;
                    var actionItems = dataTransferService.getClickedActionItems() ? dataTransferService.getClickedActionItems() :  $scope.actionItems;
                    if (!angular.isUndefined(kpiType)) {
                        if (result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                              maxDays[i]['ctr'] *= 100;
                                var kpiTypeLower = angular.lowercase(kpiType);
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }

                            $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(kpiValue), kpiType, actionItems, 990, 250, null, $scope.orderid, $scope.clicked);

                        }
                    }else{
                        $scope.chartForStrategy=false;
                        //console.log('2');
                    }
                }else{
                    $scope.chartForStrategy=false;
                    //console.log('3');
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
        $scope.setCampaignStrategyList = function(campaigns) {
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign =  domainReports.getFound($scope.campaingns[0])['campaign'];
                //Set the KPI Type here
                dataTransferService.updateExistingStorageObjects({
                    filterKpiType: dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaingns[0].kpi_type,
                    filterKpiValue : dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaingns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaingns[0].kpi_type
                });
                if(dataTransferService.getClickedStrategy()  === undefined) {
                    //console.log('Called optimization page directly ');
                    $scope.getCampaignDetails();
                }else{
                    //console.log('Came Directly from Campaign Details');
                }
            }  else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign = domainReports.getNotFound()['campaign'];
                }
            }
            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {
                    if(result.status == 'success') {
                        var campaigns = result.data.data;//.slice(0, 1000);
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaignStrategyList(campaigns);
                    }
                });
            }else{
                $scope.setCampaignStrategyList(domainReports.getCampaignListForUser());
            }
        };


        $scope.updateStrategyObjects = function(strategy){
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id =  strategyObj.id;
                $scope.selectedStrategy.name =  strategyObj.name;
                $scope.strategyFound=true;
                //Call the chart to load with the changed campaign id and strategyid
                $scope.chartForStrategy=true;

            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.chartForStrategy=false;
                $scope.tacticNotFound=true;

            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if(dataTransferService.getCampaignStrategyList(campaignId) === false){
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId , strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            }else{
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();

            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            //TODO for testing purpose, uncomment below line
            /*$scope.selectedCampaign.id =  401459;
            $scope.selectedCampaign.name =  'HARD CODED 401459';*/
            dataTransferService.updateExistingStorageObjects({
                'campaignId' : id,
                'campaignName' :  txt,
                'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId'),
                'filterKpiValue': ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi'),
                'filterKpiType': $(e.target).attr('_kpi')
            });
            $scope.$apply();

            if($scope.selectedCampaign.id !== -1) {
                $scope.chartForStrategy=true;
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.actionListForSelectedStrategy();
            }
            else{
                $scope.chartForStrategy=false;
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
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
                $scope.actionListForSelectedStrategy();
            }
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());