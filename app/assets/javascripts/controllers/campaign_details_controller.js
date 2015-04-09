/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($rootScope, $scope, $routeParams,kpiSelectModel , modelTransformer, campaignCDBData, campaignListService, campaignListModel, campaignSelectModel, strategySelectModel, actionChart, dataService, apiPaths, actionColors, utils, $timeout, pieChart, solidGaugeChart, $filter, constants, editAction, activityList, loginModel, loginService, brandsModel, analytics, dataStore, urlService) {
        var orderBy = $filter('orderBy');
        var campaign = campaignListService;
        var Campaigns = campaignListModel;
        $scope.activityLogFlag = false;
        brandsModel.disable();
        $scope.api_return_code = 200;

        $scope.actionItems = activityList.data;
        $scope.loadingViewabilityFlag = true;
        $scope.loadingCostBreakdownFlag = true;
        $scope.loadingFormatFlag = true;
        $scope.loadingInventoryFlag = true;
        $scope.loadingScreenFlag = true;
        $scope.activityLogFilterByStatus = true;
        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.campaigns = new Campaigns();
        $scope.is_network_user = loginModel.getIsNetworkUser();
        var campaignList = [];
        $scope.details = {
            campaign: null,
            details: null,
            actionChart :true
        };

        $scope.details.sortParam = 'startDate';
        //by default is desc...  most recent strategies should display first.
        $scope.details.sortDirection = 'desc';
        $scope.details.toggleSortDirection = function(dir) {
            return (dir == 'asc' ? 'desc' : 'asc');
        };
        
        $scope.details.resetSortParams = function() {
            $scope.details.sortParam = undefined;
            $scope.details.sortDirection = undefined;
        };

        $scope.details.sortIcon = function(fieldName) {
            if ($scope.details.sortParam == fieldName) {
                return $scope.details.sortDirection == 'asc' ? 'ascending' : 'descending';
            }
            return '';
        };
    
        $scope.details.sortClass = function(fieldName) {
            return $scope.details.sortParam == fieldName ? 'active' : '';
        };

        $scope.details.sortStrategies=function(fieldName){
            if ($scope.details.sortParam) {
                if ($scope.details.sortParam == fieldName) {
                    var sortDirection = $scope.details.toggleSortDirection($scope.details.sortDirection);
                    $scope.details.resetSortParams();
                    $scope.details.sortDirection = sortDirection;
                } else {
                    $scope.details.resetSortParams();
                }
            } else {
                $scope.details.resetSortParams();
            }
            !$scope.details.sortDirection && ($scope.details.sortDirection = 'asc');
            $scope.details.sortParam = fieldName;
            $scope.campaign.campaignStrategies=$filter('orderBy')($scope.campaign.campaignStrategies, fieldName,  $scope.details.getSortDirection());
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, ('sort_' + fieldName + (sortDirection ? sortDirection : '_asc')), loginModel.getLoginName());
        };
        $scope.details.getSortDirection= function(){
            return ($scope.details.sortDirection == "desc")? "true" : "false";
        };
        $scope.details.callStrategiesSorting = function(fieldName,count){
            if(count > 1){
                $scope.details.sortStrategies(fieldName);
            }
        }
        //API call for campaign details
        var url = apiPaths.apiSerivicesUrl + "/campaigns/" + $routeParams.campaignId;
        dataService.getSingleCampaign(url).then(function(result) {
            if (result.status == "success" && !angular.isString(result.data)) {
                var dataArr = [result.data.data];
                $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'life_time', 'life_time')[0];
                var selectedCampaign = {
                    id : $scope.campaign.id,
                    name : $scope.campaign.name,
                    startDate : $scope.campaign.start_date,
                    endDate : $scope.campaign.end_date,
                    kpi : $scope.campaign.kpi_type.toLowerCase()
                };
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
                campaignSelectModel.setSelectedCampaign(selectedCampaign);

                var _selectedbrandFromModel = brandsModel.getSelectedBrand() ;

                if( _selectedbrandFromModel.id !== -1 &&  _selectedbrandFromModel.name.toLowerCase() != $scope.campaign.brandName.toLowerCase()){
                   var _brand ={
                       className: "active",
                       id: -1,
                       name: "All Brands"
                   };

                    brandsModel.setSelectedBrand(_brand);

                    $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED);
                }

                campaign.getStrategiesData($scope.campaign, constants.PERIOD_LIFE_TIME);
                campaign.getTacticsData($scope.campaign, constants.PERIOD_LIFE_TIME);
                $scope.getCdbChartData($scope.campaign);
                dataService.getCampaignData('life_time', $scope.campaign).then(function(response) {
                    $scope.campaigns.cdbDataMap[$routeParams.campaignId] = modelTransformer.transform(response.data.data, campaignCDBData);
                });
                $scope.getCostBreakdownData($scope.campaign);
                $scope.getCostViewabilityData($scope.campaign);
                $scope.getInventoryGraphData($scope.campaign);
                //$scope.getFormatsGraphData($scope.campaign);
                $scope.getScreenGraphData($scope.campaign);
            } else {
                if (result.status ==='error') {
                    $scope.api_return_code = result.data.status;
                } else {
                    $scope.api_return_code = result.status;
                }
                $scope.loadingScreenFlag = false;
                $scope.screenTotal = 0;
                $scope.loadingCostBreakdownFlag = false;
                $scope.details.totalCostBreakdown = 0;
                $scope.loadingInventoryFlag = false;
                $scope.loadingViewabilityFlag = false;
                $scope.details.getCostViewability = undefined;
                $scope.getCostViewabilityFlag = 1;
                $scope.details.actionChart = false;
            }
        }, function(result) {
            console.log('call failed');
        });

        updateActionItems();

        var eventActionCreatedFunc = $rootScope.$on(constants.EVENT_ACTION_CREATED, function() {
            dataStore.deleteFromCache(urlService.APIActionData($routeParams.campaignId));
            updateActionItems();
        });

        function updateActionItems() {
            $scope.activityLogFlag = false;
            var actionUrl = urlService.APIActionData($routeParams.campaignId);
            dataService.getActionItems(actionUrl).then(function(result) {
                $scope.activityLogFlag = true;
                if(result.status === 'success') {
                    var actionItemsArray = [] ,
                        counter = 0,
                        actionItems = result.data.data,
                        strategyByActionId = {},
                        actionItemsLen = actionItems.length;
                    if (actionItemsLen > 0) {
                        for (var i = actionItemsLen - 1; i >= 0; i--) {
                            for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                                actionItems[i].action[j].action_color = actionColors[counter % 9];
                                actionItemsArray.push(actionItems[i].action[j]);
                                strategyByActionId[actionItems[i].action[j].id] = actionItems[i];
                                counter++;
                            }
                        }
                        $scope.strategyByActionId = strategyByActionId;
                        activityList.data.data = actionItemsArray;
                        dataService.updateLastViewedAction($routeParams.campaignId);
                    } else { //preventing the model from sharing old data when no activity is present for other campaigns
                        activityList.data.data = undefined;
                    }
                } else { //if error
                    activityList.data.data = undefined;
                }
            }, function(result) {
                console.log('call failed');
            });
        }

        //$scope.details.actionChart = actionChart.lineChart();
        //Function called when the user clicks on the Load more button
        $scope.loadMoreStrategies = function(campaignId) {
            var campaignArray = $scope.campaign,
                pageSize = 3,
                loadMoreData = campaignArray.campaignStrategiesLoadMore;
            if (loadMoreData.length > 0) {
                var moreData = loadMoreData.splice(0, pageSize),
                    morDataLen = moreData.length;
                var tmpCampaignStrategiesArr = [];
                for (var len = 0; len < morDataLen; len++) {
                    tmpCampaignStrategiesArr.push(moreData[len]);
                }
                //$scope.campaign.campaignStrategies = tmpCampaignStrategiesArr;
                $scope.campaign.campaignStrategies.push.apply($scope.campaign.campaignStrategies,tmpCampaignStrategiesArr);
            }
        };

        $scope.loadMoreTactics = function(strategyId, campaignId) {
            var campaignArray = $scope.campaign,
                pageSize = 3,
                campaignStrategies = campaignArray.campaignStrategies;
            for(var i in campaignStrategies){
                if(campaignStrategies[i].id === Number(strategyId)){
                    var loadMoreData = campaignStrategies[i].strategyTacticsLoadMore;
                    if (loadMoreData.length > 0) {
                        var moreData = loadMoreData.splice(0, pageSize)
                        var moreDataLen = moreData.length;
                        var tmpstrategyTacticsArr = [];
                        for (var len = 0; len < moreDataLen; len++) {
                            tmpstrategyTacticsArr.push(moreData[len]);
                        }
                        $scope.campaign.campaignStrategies[i].strategyTactics =  tmpstrategyTacticsArr;
                    }
                }
            }    
        };

        $scope.makeCampaignSelected = function(id) {
            var splitIdList =  id.split(",");
            var myContainer = $('#action-container:first');
            if(splitIdList && splitIdList.length > 1 ){
                var scrollTo = $('#actionItem_' + splitIdList[0]);
                scrollTo.siblings().removeClass('active').end().addClass('active');
                //Mulitple Activity List
                var splitIdListLen = splitIdList.length;
                for(var i=0;i < splitIdListLen;i++){
                      var targetId =splitIdList[i];
                       myContainer.find('#actionItem_'+targetId).addClass('active');
                       if(scrollTo.length >0) {
                           myContainer.animate({
                            scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                          });
                       }
                 }
            } else { //Day wise single Activity
                var scrollTo = $('#actionItem_' + id);
                if(scrollTo && scrollTo.length >0) {
                    scrollTo.siblings().removeClass('active').end().addClass('active');
                    myContainer.animate({
                        scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });
                }
            }
        };

        $scope.getCostBreakdownData  = function(campaign){
            var costData, other = 0, sum;
             //get cost break down data
            dataService.getCostBreakdown($scope.campaign).then(function(result) {
                $scope.loadingCostBreakdownFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
                     if(result.data.data.costData.length>0){
                        costData = result.data.data.costData[0];
                        sum = costData.inventory_cost_pct + costData.data_cost_pct + costData.ad_serving_cost_pct;
                        if(sum < 100){
                            other = 100 - sum;
                        }
                        $scope.details.getCostBreakdown = {
                            inventory: costData.inventory_cost_pct,
                            data: costData.data_cost_pct,
                            adServing: costData.ad_serving_cost_pct,
                            other: other
                        };
                        $scope.getCostBreakdownInfo = [
                            {name:'Inventory',value:costData.inventory_cost_pct,className:'color1',colorCode:'#F8810E'},
                            {name:'Data',value:costData.data_cost_pct,className:'color2',colorCode:'#0072BC'},
                            {name:'Ad Serving',value:costData.ad_serving_cost_pct,className:'color3',colorCode:'#45CB41'},
                            {name:'Other',value:other,className:'color4',colorCode:'#BFC3D1'}
                        ];
                        $scope.details.totalCostBreakdown = costData.total;
                        $scope.order = function(predicate, reverse) {
                            $scope.costBreakdownChartInfo = orderBy($scope.getCostBreakdownInfo, predicate, reverse);
                        };
                        $scope.order('-value',false);
                        $timeout(function(){
                             $scope.details.pieChart=pieChart.highChart($scope.costBreakdownChartInfo);
                         });
                     }
                }
            },function(result){
                console.log('cost break down call failed');
            });
        };

        $scope.getInventoryGraphData  = function(campaign){
            var inventory =[] ;
            dataService.getCostInventoryData($scope.campaign,'life_time').then(function(result) {
                $scope.loadingInventoryFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
                    var campaignKpiType = campaign.kpiType.toLowerCase();
                    if(result.data.data.length>0){
                        var result = result.data.data[0].inv_metrics ;
                        var top =[];
                        for (var i in result) {
                            if (result[i].tb === 0) {
                                top.push(result[i]);
                            }
                        }
                        if(top.length > 0){
                            if(campaignKpiType == 'ctr' || campaignKpiType == 'vtc' || campaignKpiType == 'action_rate' || campaignKpiType  == 'action rate' ){
                              for(var i in top){
                                  top[i].kpi_value *= 100;
                              }
                              inventory = top.slice(0,3);
                              $scope.details.inventoryTop = inventory[0];
                            } else {
                              inventory = top.slice(0,3);
                              $scope.details.inventoryTop = inventory[2];
                            }
                        }
                        $scope.details.inventory = inventory;
		            }
                }
            },function(result){
                console.log('inventory data call failed');
            });
        };

        $scope.getFormatsGraphData  = function(campaign){
            var formats;
            dataService.getCostFormatsData($scope.campaign, 'life_time').then(function(result) {
                $scope.loadingFormatFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
            	    for (var i = 0; i < result.data.data.length; i++) {
            		  result.data.data[i].ctr *= 100;
            		  result.data.data[i].vtc = result.data.data[i].video_metrics.vtc_rate * 100;
            	    }
                    var campaignKpiType = campaign.kpiType.toLowerCase();
                    if(result.data.data.length>0){

                        if(campaignKpiType == 'ctr' || campaignKpiType == 'vtc' || campaignKpiType == 'action_rate' || campaignKpiType == 'action rate') {
                            formats=_.chain(result.data.data)
                                .sortBy(function(format){ return format[campaignKpiType]; })
                                .reverse()
                                .value();
                         }else{
                            formats=_.chain(result.data.data)
                                .sortBy(function(format){ return format[campaignKpiType]; })
                                .value();

                         }

                        _.each(formats, function(format) {
                            format.icon = format.dimension.toLowerCase() + "_graph";
                        });

                        $scope.details.formats = formats;
                        $scope.details.formatTop = (campaignKpiType == 'ctr' || campaignKpiType == 'vtc') ? _.first(formats) : _.last(formats);
                        $scope.details.formatTop = $scope.details.formatTop[campaignKpiType];
                        $scope.details.kpiType = campaignKpiType;
                    }
                }
            },function(result){
                console.log('formats data call failed');
            });
        };
         $scope.getScreenGraphData  = function(campaign){
            var screens,
                orderByscreens = new Array(),
                inc = 0;
            $scope.screenTotal = 0;
            dataService.getScreenData($scope.campaign).then(function(result) {
                $scope.loadingScreenFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
                    var resultDataLen = result.data.data.length,
                        campaignKpiType = campaign.kpiType.toLowerCase();
                    for (var i = 0; i < resultDataLen; i++) {
                      result.data.data[i].ctr *= 100;
                      result.data.data[i].vtc = result.data.data[i].video_metrics.vtc_rate * 100;
                    }
                    if(resultDataLen>0){
                        screens = orderBy(result.data.data, "-" + campaignKpiType, ((campaignKpiType == 'ctr' || campaignKpiType == 'vtc') ?  false : true));
                        _.each(screens, function(screen) {
                             var screenType = screen.dimension.toLowerCase();
                             if(screenType == 'smartphone' || screenType == 'tablet' || screenType =='desktop'){
                                if(screen[campaign.kpiType.toLowerCase()] > 0){
                                    $scope.screenTotal +=screen[campaignKpiType];
                                     orderByscreens[inc]=screen[campaignKpiType];
                                     inc++;  
                                }
                                    
                            }
                             switch(screenType){
                                case 'smartphone': screen.icon = "mobile_graph"; break;
                                case 'tv':   screen.icon = "display_graph"; break;
                                case 'tablet':   screen.icon = "tablet_graph"; break;
                                case 'desktop':   screen.icon = "display_graph"; break;
                            }
                        });
                        var maximumValue = 0 ;
                        if(orderByscreens.length > 0 ){
                            maximumValue = Math.max.apply(Math,orderByscreens);
                        }
                        $scope.details.screens = screens; 
                        $scope.details.screenTop = maximumValue;
                        $scope.details.kpiType = campaignKpiType;
                    }
                }
            },function(result){
                console.log('screen data call failed');
            });
        };
        $scope.getCostViewabilityData  = function(campaign){
            var viewabilityData, viewData;
             //get cost break down data
             $scope.getCostViewabilityFlag = 0;
            dataService.getCostViewability(campaign,'life_time').then(function(result) {
                 $scope.getCostViewabilityFlag = 1;
                 $scope.loadingViewabilityFlag = false;
                if (result.status == "success" && !angular.isString(result.data.data)) {
                        viewData = result.data.data;
                        $scope.details.getCostViewability = {
                            pct_1s: viewData.viewable_imps_1s_pct,
                            pct_5s: viewData.viewable_imps_5s_pct,
                            pct_15s: viewData.viewable_imps_15s_pct,
                            pct_total: viewData.viewable_pct
                        };
                        $scope.details.getCostViewability.total = viewData.viewable_imps;
                        $timeout(function(){
                            $scope.details.solidGaugeChart=solidGaugeChart.highChart($scope.details.getCostViewability);
                        });
                }
            },function(result){
                console.log('cost viewability call failed');
            });
        };
        $scope.getCdbChartData = function(campaign) {
            //API call for campaign chart
            dataService.getCdbChartData(campaign, 'life_time', 'campaigns', null).then(function (result) {
                var lineData = [], showExternal = true;
                if (result.status == "success" && !angular.isString(result.data)) {
                    if (!angular.isUndefined($scope.campaign.kpiType)) {
                        if (result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            var kpiType = ($scope.campaign.kpiType), kpiTypeLower = kpiType.toLowerCase();
                            for (var i = 0; i < maxDays.length; i++) {
                                maxDays[i]['ctr'] *= 100;
				                maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate * 100;
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }
                            $scope.details.lineData = lineData;
                           // $timeout(function() {
                                $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data , 450, 330, null, undefined, showExternal);
                            //},10000);
                            if ((localStorage.getItem('actionSel') !== null)) {
                                $scope.makeCampaignSelected(localStorage.getItem('actionSel'));
                            }
                        }
                    } else {
                        $scope.details.actionChart = false;
                    }
                } else {
                    $scope.details.actionChart = false;
                }
            });
        };

        $scope.viewReports = function(campaign, strategy){
            campaignSelectModel.setSelectedCampaign(campaign);
            strategySelectModel.setSelectedStrategy(strategy);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);

            // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just fetch strategy list and retain selected strategy.
            localStorage.setItem('isNavigationFromCampaigns', true);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'view_report_for_strategy', loginModel.getLoginName());
            document.location = '#/performance';
        };

        $scope.getMessageForDataNotAvailable = function (campaign,dataSetType) {
            if (!campaign) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if (campaign.durationLeft() == 'Yet to start') {
                return constants.MSG_CAMPAIGN_YET_TO_START;
            } else if (campaign.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            } else if (campaign.kpiType == 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else if (campaign.status == 'active') {
              return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
            } else if (dataSetType == 'activities') {
              if(campaignSelectModel.durationLeft() == 'Ended')
                return constants.MSG_CAMPAIGN_NOT_OPTIMIZED;
              else
                return constants.MSG_METRICS_NOT_TRACKED;
            } else if ((dataSetType == 'inventory' || dataSetType == 'viewability')
              &&(campaignSelectModel.durationLeft() == 'Ended'||campaignSelectModel.durationLeft() !== 'Ended')){
                return constants.MSG_METRICS_NOT_TRACKED;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };

        $scope.setOptimizationData = function( campaign, action, strategyByActionId){
            campaignSelectModel.setSelectedCampaign(campaign);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);
            strategySelectModel.setSelectedStrategy(constants.ALL_STRATEGIES_OBJECT);

            var actionData = {
                selectedAction : action ,
                selectedActionItems : activityList.data.data
            };
            // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just fetch strategy list and retain selected strategy.

            localStorage.setItem('isNavigationFromCampaigns', true);
            localStorage.setItem('selectedAction',JSON.stringify(action) );
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'activity_log_detailed_report', loginModel.getLoginName(), action.id);
            document.location = '#/optimization';
        };

        $scope.setActivityButtonData = function( campaign, strategy){
            campaignSelectModel.setSelectedCampaign(campaign);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);
            strategySelectModel.setSelectedStrategy(strategy);

            var actionData ={
                selectedAction : undefined ,
                selectedActionItems : activityList.data.data
            };
            // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just fetch strategy list and retain selected strategy.
            localStorage.setItem('isNavigationFromCampaigns', true);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'view_activity_for_strategy', loginModel.getLoginName());
            document.location = '#/optimization';
        };

        $scope.setGraphData = function(campaign, type){
            if (campaign) {
                campaignSelectModel.setSelectedCampaign(campaign);
                strategySelectModel.setSelectedStrategy(constants.ALL_STRATEGIES_OBJECT);
                kpiSelectModel.setSelectedKpi(campaign.kpiType);
            }
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, (type === 'view_report' ? type : type + '_widget'), loginModel.getLoginName());

            if (type === 'cost') {
                utils.goToLocation('/cost');
            } else if (type === 'viewability') {
                utils.goToLocation('/viewability');
            } else if (type === 'inventory') {
                utils.goToLocation('/inventory');
            } else if (type === 'view_report' || type === 'format' || type == 'screens') {
                utils.goToLocation('/performance');
            } else {
                utils.goToLocation('/#/optimization');
            }
        };

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;

        $scope.watchActionFilter = function(filter, showExternal) {
            $scope.activityLogFilterByStatus = showExternal;
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 450, 330 , null, undefined, showExternal);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'activity_log_' + (showExternal ? 'external' : 'all'), loginModel.getLoginName());
            return filter;
        };

        /*Single Campaign UI Support elements - starts */
        $scope.getSpendDifference = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var spendDifference = -999; //fix for initial loading
                var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                if (campaignCDBObj == undefined) {
                    return spendDifference;
                }
                var spend = campaignCDBObj.getGrossRev();
                var expectedSpend = campaign.expectedMediaCost;
                return $scope.getPercentDiff(expectedSpend, spend);
            }
        };

        $scope.getSpendTotalDifference = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var spendDifference = 0;
                var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                if (campaignCDBObj == undefined) {
                    return spendDifference;
                }
                var spend = campaignCDBObj.getGrossRev();
                var totalSpend = campaign.totalMediaCost;
                return $scope.getPercentDiff(totalSpend, spend);
            }
        };

        $scope.getSpendTickDifference = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var spendDifference = 0;
                var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                if (campaignCDBObj == undefined) {
                    return spendDifference;
                }
                var spend = campaign.expectedMediaCost;
                var expectedSpend = campaign.totalMediaCost;
                return $scope.getPercentDiff(expectedSpend, spend);
            }
        };
        $scope.getPercentDiff = function(expected, actual) {
            return (expected > 0) ? utils.roundOff((actual - expected) * 100 / expected, 2) : 0;
        }
        $scope.getSpendDiffForStrategy = function(strategy) {
            if (typeof strategy == 'undefined') {
                return 0;
            }
            var expectedSpend = strategy.expectedMediaCost;
            return $scope.getPercentDiff(expectedSpend, strategy.grossRev)
        }
        $scope.getSpendTotalDifferenceForStrategy = function(strategy) {
            if(typeof campaign !== 'undefined') {
                var spendDifference = 0,
                    spend = strategy.grossRev,
                    totalSpend = strategy.totalMediaCost;
                return $scope.getSpendDiffForStrategy(totalSpend, spend);
            }
        };
        $scope.getSpendClass = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var spendDifference = $scope.getSpendDifference(campaign);
                return $scope.getClassFromDiff(spendDifference);
            }
        };
        $scope.getSpendClassForStrategy = function(strategy) {
            var spendDifference = $scope.getSpendDiffForStrategy(strategy);
            return $scope.getClassFromDiff(spendDifference);
        };
        $scope.getClassFromDiff = function(spendDifference) {
            if (spendDifference > -1) {
                return 'blue';
            }
            if (spendDifference <= -1 && spendDifference > -10) {
                return 'amber';
            }
            if (spendDifference == -999) { //fix for initial loading
                return ' ';
            }
            return 'red';
        };
        $scope.getSpendWidth = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var actualWidth = 100 + $scope.getSpendTotalDifference(campaign);
                if (actualWidth > 100) {
                    actualWidth = 100;
                }
                return actualWidth;
            }
        };
        $scope.getSpendTickWidth = function(campaign) {
            if(typeof campaign !== 'undefined') {
                var actualWidth = 100 + $scope.getSpendTickDifference(campaign);
                if (actualWidth > 100) {
                    actualWidth = 100;
                }
                return actualWidth;
            }
        };
        $scope.getSpendWidthForStrategy = function(strategy) {
            var actualWidth = 100 + $scope.getSpendTotalDifferenceForStrategy(strategy);
            if (actualWidth > 100) {
                actualWidth = 100;
            }
            return actualWidth;
        };
        $scope.refreshGraph = function(showExternal){ /*Single Campaign UI Support elements - sta */ /*Refresh Graph Data */
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 450, 330 , null, undefined, showExternal);
        };

        var callRefreshGraphData = $rootScope.$on("callRefreshGraphData",function(event,args){
            $scope.refreshGraph(args);
        });

        $scope.$on('$destroy', function() {
            eventActionCreatedFunc();
            callRefreshGraphData();
        });

        $scope.refreshCampaignDetailsPage = function(){
            $rootScope.$broadcast("closeEditActivityScreen");
        };
        $scope.refreshCampaignDetailsPage();
    });
}());
