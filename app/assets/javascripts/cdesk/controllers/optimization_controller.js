var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, $location, $anchorScroll, dataService, optimizationService, utils, $http, dataTransferService, actionChart, $timeout, domainReports, apiPaths, actionColors, campaignListService,constants, timePeriodModel) {

        var campaign = campaignListService;
        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        $scope.selectedCampaign = domainReports.getDefaultValues()['campaign'];

        $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.download_urls = {
            optimization: null
        };

        $scope.seeDate = {
            value : '',
            className: ''
        };

        $scope.dataInit = function () {
            $scope.tacticList = [];
            $scope.navigationFromReports = true;
            $scope.campaignActionList = [];
            $scope.clicked = {
                action: {},
                strategy: {
                    action: {}
                },
                campaignName: {},
                orderId: {},
                campaign: {
                    start_date: {},
                    end_date: {}
                }
            };

            $scope.filters = domainReports.getReportsDropDowns();
            $scope.orderByField = 'created_at';
            $scope.reverseSort = true;

            if(localStorage.getItem(user_id+'_opt_seeDate') === undefined || localStorage.getItem(user_id+'_opt_seeDate') === null){
                $scope.seeDate.value = false;
                $scope.seeDate.className = '';
            } else {
                $scope.seeDate.value = localStorage.getItem(user_id+'_opt_seeDate');
                $scope.seeDate.className = (localStorage.getItem(user_id+'_opt_seeDate') == "true" ? 'see_dates_selected' : '');
            }
        };

        $scope.dataInit();


        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };

        $scope.actionDataForSelectedStrategy = function () {
            var counter = 0;
            var actionItems = $scope.campaignActionList;
            var actionItemsArray = [];
            if (actionItems.length > 0 && $scope.selectedStrategy.id != -1) {
                for (var i = 0; i < actionItems.length; i++) {
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
                $scope.lineItemName = $scope.selectedStrategy.name;
                //   $scope.lineItemName = $scope.clicked.action.lineItemName;
                if (actionItemsArray.length > 0) {
                    $scope.tacticNotFound = false;
                    $scope.loadTableData();
                } else {
                    $scope.tacticNotFound = true;
                    //    $scope.chartForStrategy = false;
                }
            } else {
                $scope.tacticNotFound = true;
            }
            // It is possible that the selected strategy has no action still it can have cdb data
            if ($scope.selectedStrategy.id != -1) {
                $scope.loadCdbDataForStrategy();
            }
            else {
                $scope.chartForStrategy = false;
            }

        };

        $scope.actionDataForSelectedCampaign = function () {
            var param = {
                campaignId: $scope.selectedCampaign.id
            };
            if ($scope.campaignActionList === 'undefined' || $scope.campaignActionList.length === 0) {
                // get action data for the selected campaign.
                optimizationService.getActionsForSelectedCampaign(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.campaignActionList = result.data.data;
                        $scope.actionDataForSelectedStrategy();
                    }
                    else {
                        $scope.noTacticsFound = true;
                        // If no actions found for a campaign still CDB chart should be shown
                        if ($scope.selectedStrategy.id !== -1) {
                            $scope.loadCdbDataForStrategy();
                        }
                    }
                })

            }
            else { // already have action data for selected campaing
                $scope.actionDataForSelectedStrategy();
            }

        };

        $scope.getCampaignDetails = function () {
            //API call for campaign details
            var url = apiPaths.apiSerivicesUrl + "/campaigns/" + $scope.selectedCampaign.id + "?user_id=" + user_id;
            dataService.getSingleCampaign(url).then(function (result) {
                if (result.data.data !== undefined) {
                    var res = result.data.data;
                    $scope.campaign = {
                        id: res.id,
                        start_date: res.start_date,
                        end_date: res.end_date,
                        kpi_type: res.kpi_type,
                        kpi_value: res.kpi_value
                    };
                }
                $scope.actionDataForSelectedCampaign();
                //  $scope.actionListForSelectedStrategy();
            }, function (result) {
                console.log('call failed');
            });
        };

        $scope.init = function () {
            //To set the active tab for reports
            //     $scope.campaignlist();  //First load the campaign List
            if (dataTransferService.getClickedStrategy() !== undefined) {
                $scope.clicked.strategy = dataTransferService.getClickedStrategy();
                $scope.clicked.action = dataTransferService.getClickedAction();
                $scope.clicked.campaign.start_date = dataTransferService.getClickedCampaignEndDate();
                $scope.clicked.campaign.end_date = dataTransferService.getClickedCampaignEndDate();
                $scope.clicked.campaignName = dataTransferService.getClickedCampaignName();
                $scope.clicked.orderId = dataTransferService.getClickedCampaignId();
                $scope.reachUrl = '/campaigns#/campaigns/' + $scope.clicked.orderId;
                $scope.lineItemName = $scope.clicked.strategy.lineItemName;

                $scope.navigationFromReports = dataTransferService.getNavigationFromReports();
                $scope.selectedCampaign.id = $scope.clicked.orderId;
                $scope.selectedCampaign.name = $scope.clicked.campaignName;
                $scope.selectedStrategy.id = $scope.clicked.strategy.lineitemId;
                $scope.selectedStrategy.name = $scope.clicked.strategy.lineItemName;

                // call getCampaingn details to

                $scope.loadTableData();
                $scope.loadCdbDataForStrategy();
            }
        };

        $scope.actionSelected = function (id) {
            var myContainer = $('.reports_section_details_container');//$('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            if (scrollTo.length) {
                myContainer.find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + this.id).addClass('action_selected');
                myContainer.animate({
                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                });
            }
            localStorage.removeItem('actionSel');
        };

        $scope.loadTableData = function () {
            var tacticList = [];
            var actionItems = $scope.clicked.strategy.action;
            for (var index in actionItems) {
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
            $scope.tacticList = tacticList;
            var action = (dataTransferService.getClickedAction() !== undefined ) ? dataTransferService.getClickedAction() : actionItems[0];
            $scope.actionId = action.ad_id + '' + action.id;
            if (action) {
                if ($scope.actionId !== null) {
                    $timeout(function () {

                        $scope.actionSelected($scope.actionId);

                    }, 7000);
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

        $scope.roundOff = function (value, places) {
            var factor = Math.pow(10, places);
            var rounded = Math.round(value * factor) / factor;
            return Math.abs(rounded);
        };

        $scope.goToGraph = function (id) {
            $("html,body").animate({scrollTop: 0}, '300');
        };

        $scope.showSelected = function (id) {
            $('#action-container:first').find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + id).addClass('action_selected');
            $('.reports_section_details_container').find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + id).addClass('action_selected');
            $('circle').attr({stroke: '#0070CE', fill: '#ffffff'});
            $('circle#' + id).attr({stroke: '#0070CE', fill: '#0070CE'});
            localStorage.setItem('actionSel', 'actionItem_' + id);
        };


        $scope.formatMetric = function (val1, metricImpacted) {


            if (metricImpacted === "CPC" || metricImpacted === "CPA" || metricImpacted === "CPM")
                return '$' + val1.toFixed(2);
            else if (metricImpacted === "Delivery (Impressions)") {

                return (val1.toFixed(2)).toLocaleString();
            }

            else
                return val1.toFixed(2);
        };

        $scope.chartForStrategy = true;
        $scope.loadCdbDataForStrategy = function () {

            if ($scope.navigationFromReports == true) {
                var param = {
                    orderId: parseInt($scope.selectedCampaign.id),
                    startDate: $scope.campaign.start_date,
                    endDate: $scope.campaign.end_date
                };
            } else {
                var param = {
                    orderId: parseInt($scope.selectedCampaign.id),
                    startDate: $scope.clicked.campaign.start_date,
                    endDate: $scope.clicked.campaign.end_date
                }
            }
            var strategyId = $scope.selectedStrategy.id;

            dataService.getCdbChartData(param, 'lifetime', 'strategies', strategyId, true).then(function (result) {
                var lineData = [];
                if (result.status == "success" && !angular.isString(result.data)) {
                    var kpiType = dataTransferService.getClickedKpiType() ? dataTransferService.getClickedKpiType() : $scope.campaign.kpi_type;
                    var kpiValue = dataTransferService.getClickedKpiValue() ? dataTransferService.getClickedKpiValue() : $scope.campaign.kpi_value;
                    var actionItems = dataTransferService.getClickedActionItems() ? dataTransferService.getClickedActionItems() : $scope.actionItems;
                    if (!angular.isUndefined(kpiType)) {
                        if (result.data.data.measures_by_days.length > 0) {
                            // $scope.chartForStrategy = true;
                            // Double check if selected campaign and strategy is same as for which we got CDB data

                            if ($scope.selectedCampaign.id == param.orderId && $scope.selectedStrategy.id == strategyId) {
                                //  $scope.chartForStrategy = true ;
                                var maxDays = result.data.data.measures_by_days;
                                for (var i = 0; i < maxDays.length; i++) {
                                    maxDays[i]['ctr'] *= 100;
                                    var kpiTypeLower = angular.lowercase(kpiType);
                                    lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                }

                                $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(kpiValue), kpiType, actionItems, 990, 250, true, $scope.actionId, $scope.clicked, $scope.navigationFromReports);

                            }
                            else {
                                // CDB data obtained is not for currently selected campaing and strategy id
                                $scope.chartForStrategy = false;
                            }

                        }
                    } else {
                        $scope.chartForStrategy = false;
                    }
                } else {
                    $scope.chartForStrategy = false;

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

        $scope.callBackCampaignsSuccess = function () {
            dataTransferService.updateExistingStorageObjects({
                filterKpiType: dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $('#campaigns_list li:first').attr('_kpi'),
                filterKpiValue: dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($('#campaigns_list li:first').attr('_kpi') === 'action_rate') ? 'Action Rate' : $('#campaigns_list li:first').attr('_kpi')
            });
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/optimization/';
            $scope.download_urls = {
                optimization: urlPath + 'download?date_filter=' + $scope.selected_filters.time_filter
            };

        };

        $scope.callBackCampaignsFailure = function () {
        };


        $scope.updateStrategyObjects = function (strategy) {
            $scope.strategies = strategy;

            if ($scope.navigationFromReports == true) {
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    //If a different campaign is selected, then load the first strategy data
                    var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                    $scope.selectedStrategy.id = strategyObj.id;
                    $scope.selectedStrategy.name = strategyObj.name;
                    $scope.selectedStrategy.startDate = strategyObj.startDate;
                    $scope.selectedStrategy.endDate = strategyObj.endDate;
                    $scope.strategyFound = true;

                    //Call the chart to load with the changed campaign id and strategyid
                    //  $scope.chartForStrategy=true;

                    if ($scope.selectedStrategy.id !== -1) { // Means selected campaing has valid strategy
                        $scope.getCampaignDetails();
                    }
                    else {
                        $scope.noTacticsFound = true;
                        $scope.chartForStrategy = false;
                    }

                } else { //  means empty strategy list
                    $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    $scope.chartForStrategy = false;
                    $scope.tacticNotFound = true;

                }
            }
        };

        $scope.strategylist = function (campaignId) {
            if ($scope.navigationFromReports == true) {
                $scope.selectedStrategy.name = "Loading...";
            }
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                });

        };

        $scope.callBackCampaignChange = function () {
            // means navigation is not from campaign details page
            $scope.navigationFromReports = true;
            // if coming form campaign details page then $scope.campaing will be undefined.

            // clean the existing campaign data list
            $scope.dataInit();
            $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];
            if ($scope.selectedCampaign.id !== -1) {
                $scope.chartForStrategy = true;
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            }
            else {
                $scope.chartForStrategy = false;
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
         //   $scope.$apply();

        };

        $scope.callBackKpiDurationChange = function (kpiType) {
            // console.log("duration is changed");
            $scope.chartForStrategy = true;
            if (kpiType == 'duration') {
                if ($scope.selectedStrategy.id !== -1) { // Means selected campaing has valid strategy
                    $scope.actionDataForSelectedCampaign()
                }
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});

                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/optimization/';
                $scope.download_urls = {
                    optimization: urlPath + 'download?date_filter=' + $scope.selected_filters.time_filter
                };
            } //else {
//                $scope.$apply();
//                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
//            }
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.chartForStrategy = true;
            if ($scope.selectedStrategy.id !== -1) { // Means selected campaing has valid strategy
                $scope.actionDataForSelectedCampaign()
            }
            else {
                // means selected strategy id is not valid
                $scope.chartForStrategy = false;
                $scope.noTacticsFound = true;
            }
        };

        $("#optimization_squaredFour").click( function() {
                if( $(this).is(":checked") == true ) {
                    localStorage.setItem(user_id+'_opt_seeDate',true);
                    $scope.seeDate.value = true;
                    $scope.seeDate.className = 'see_dates_selected' ;
                    $(".details_with_heading_total").addClass("see_dates_selected") ;
                } else {
                    localStorage.setItem(user_id+'_opt_seeDate',false);
                    $scope.seeDate.value = false;
                    $scope.seeDate.className = '' ;
                    $(".details_with_heading_total").removeClass("see_dates_selected") ;
                }
            $scope.$apply();
        });


        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

    });
}());