/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($rootScope, $scope, $routeParams,kpiSelectModel , modelTransformer, campaignCDBData, campaignListService, campaignListModel, campaignSelectModel, strategySelectModel, actionChart, dataService, apiPaths, actionColors, utils, $timeout, pieChart, solidGaugeChart, $filter, constants, editAction, activityList, loginModel, loginService, brandsModel, analytics, dataStore, urlService) {
        var orderBy = $filter('orderBy');
        var campaign = campaignListService;
        var Campaigns = campaignListModel;
        $scope.activityLogFlag = false;
        brandsModel.disable();
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
            if (dir == 'asc') {
                return 'desc';
            }
            return 'asc';
        };
        
        $scope.details.resetSortParams = function() {
            $scope.details.sortParam = undefined;
            $scope.details.sortDirection = undefined;
        };
        $scope.details.sortIcon = function(fieldName) {
            if ($scope.details.sortParam == fieldName) {localStorage
                return $scope.details.sortDirection == 'asc' ? 'ascending' : 'descending';
            } else {
                return '';
            }
        };
    
        $scope.details.sortClass = function(fieldName) {
            if ($scope.details.sortParam == fieldName) {
                return 'active';
            } else {
                return '';
            }
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
                }!$scope.details.sortDirection && ($scope.details.sortDirection = 'asc');
                $scope.details.sortParam = fieldName;

            //filter
            $scope.campaign.campaignStrategies=$filter('orderBy')($scope.campaign.campaignStrategies, fieldName,  $scope.details.getSortDirection());
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, ('sort_' + fieldName + (sortDirection ? sortDirection : '_asc')), loginModel.getLoginName());
 
        };
        $scope.details.getSortDirection= function(){
            return ($scope.details.sortDirection == "desc")? "true" : "false";
        };


        //API call for campaign details
//        var url = "/campaigns/" + $routeParams.campaignId + ".json?filter[date_filter]=life_time";
        var url = apiPaths.apiSerivicesUrl + "/campaigns/" + $routeParams.campaignId;

        dataService.getSingleCampaign(url).then(function(result) {
            if (result.data.data) {
                var dataArr = [result.data.data];
                $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'life_time', 'life_time')[0];
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
            }
        }, function(result) {
            console.log('call failed');
        });
        updateActionItems();

      $rootScope.$on(constants.EVENT_ACTION_CREATED, newActionCreated);
      function newActionCreated() {
        dataStore.deleteFromCache(urlService.APIActionData($routeParams.campaignId));
        updateActionItems();
      }
      function updateActionItems() {
        $scope.activityLogFlag = false;
        //activityList.data.data = undefined;
        var actionUrl = urlService.APIActionData($routeParams.campaignId);
        dataService.getActionItems(actionUrl).then(function(result) {
          $scope.activityLogFlag = true;
          if(result.status === 'success') {
            var actionItemsArray = [] , counter = 0;
            var actionItems = result.data.data;
            var strategyByActionId = {};
            if (actionItems.length > 0) {
              for (var i = actionItems.length - 1; i >= 0; i--) {
                for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                  actionItems[i].action[j].action_color = actionColors[counter % 9];
                  //actionItems[i].action[j].ad_name = actionItems[i].ad_name;
                  //actionItems[i].action[j].ad_id = actionItems[i].ad_id;
                  actionItemsArray.push(actionItems[i].action[j]);
                  strategyByActionId[actionItems[i].action[j].id] = actionItems[i];
                  counter++;
                }
              }
              $scope.strategyByActionId = strategyByActionId;
              activityList.data.data = actionItemsArray;
              dataService.updateLastViewedAction($routeParams.campaignId);
            } else {
              //preventing the model from sharing old data when no activity is present for other campaigns
              activityList.data.data = undefined;
            }
          }else{ //if error 
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
                pageSize = 3;
            var loadMoreData = campaignArray.campaignStrategiesLoadMore;
            if (loadMoreData.length) {
                var moreData = loadMoreData.splice(0, pageSize)
                for (var len = 0; len < moreData.length; len++) {
                    $scope.campaign.campaignStrategies.push(moreData[len]);
                }
            }
        };

        $scope.loadMoreTactics = function(strategyId, campaignId) {
            var campaignArray = $scope.campaign,
                pageSize = 3;
            for(var i in campaignArray.campaignStrategies){
                if(campaignArray.campaignStrategies[i].id === parseInt(strategyId)){
                    var loadMoreData = campaignArray.campaignStrategies[i].strategyTacticsLoadMore;
                    if (loadMoreData.length) {
                        var moreData = loadMoreData.splice(0, pageSize)
                        for (var len = 0; len < moreData.length; len++) {
                            $scope.campaign.campaignStrategies[i].strategyTactics.push(moreData[len]);
                        }
                    }
                }
            }    
        };

        $scope.makeCampaignSelected = function(id) {
            var myContainer = $('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            if(scrollTo.length) {
            scrollTo.siblings().removeClass('active').end().addClass('active');
            myContainer.animate({
                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
            });
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
                    if(result.data.data.length>0){
                        var result = result.data.data[0].inv_metrics ;
                        var top =[];
                        for (var i in result) {

                            if (result[i].tb === 0) {
                                top.push(result[i]);
                            }
                        }
                          if(top.length > 0){
                              if(campaign.kpiType.toLowerCase() == 'ctr' || campaign.kpiType.toLowerCase() == 'vtc' || campaign.kpiType.toLowerCase() == 'action_rate' || campaign.kpiType.toLowerCase()  == 'action rate' ){

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
                    if(result.data.data.length>0){

                        if(campaign.kpiType.toLowerCase() == 'ctr' || campaign.kpiType.toLowerCase() == 'vtc' || campaign.kpiType.toLowerCase() == 'action_rate' || campaign.kpiType.toLowerCase() == 'action rate') {
                            formats=_.chain(result.data.data)
                                .sortBy(function(format){ return format[campaign.kpiType.toLowerCase()]; })
                                .reverse()
                                .value();
                         }else{
                            formats=_.chain(result.data.data)
                                .sortBy(function(format){ return format[campaign.kpiType.toLowerCase()]; })
                                .value();

                         }

                        _.each(formats, function(format) {
                            switch(format.dimension){
                                case 'Display': format.icon = "display_graph";
                                break;
                                case 'Video':   format.icon = "video_graph";
                                break;
                                case 'Mobile':   format.icon = "mobile_graph";
                                break;
                                case 'Social':   format.icon = "social_graph";
                                break;
                            }
                        });
                        $scope.details.formats = formats; 
                        if(campaign.kpiType.toLowerCase() == 'ctr' || campaign.kpiType.toLowerCase() == 'vtc') {
                            $scope.details.formatTop = _.first(formats); 
                        }else{
                            $scope.details.formatTop = _.last(formats); 
                        }
                        $scope.details.formatTop = $scope.details.formatTop[campaign.kpiType.toLowerCase()];
                        $scope.details.kpiType = campaign.kpiType.toLowerCase();
                    }
                }
            },function(result){
                console.log('formats data call failed');
            });
        };
         $scope.getScreenGraphData  = function(campaign){
            var screens;
            $scope.screenTotal = 0;
            var orderByscreens = new Array();
            var inc = 0;
            dataService.getScreenData($scope.campaign).then(function(result) {
                $scope.loadingScreenFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
                    for (var i = 0; i < result.data.data.length; i++) {
                      result.data.data[i].ctr *= 100;
                      result.data.data[i].vtc = result.data.data[i].video_metrics.vtc_rate * 100;
                    }
                    if(result.data.data.length>0){
                        if(campaign.kpiType.toLowerCase() == 'ctr' || campaign.kpiType.toLowerCase() == 'vtc') {
                            screens = orderBy(result.data.data, "-"+campaign.kpiType.toLowerCase(), false);
                         }else{
                            screens = orderBy(result.data.data, "-"+campaign.kpiType.toLowerCase(), true);
                         }
                        _.each(screens, function(screen) {
                             if(screen.dimension.toLowerCase() == 'smartphone' || screen.dimension.toLowerCase() == 'tablet' || screen.dimension.toLowerCase() =='desktop'){
                                if(screen[campaign.kpiType.toLowerCase()] > 0){
                                    $scope.screenTotal +=screen[campaign.kpiType.toLowerCase()];
                                     orderByscreens[inc]=screen[campaign.kpiType.toLowerCase()];
                                     inc++;  
                                }
                                    
                            }
                             switch(screen.dimension){
                                case 'Smartphone': screen.icon = "mobile_graph";
                                break;
                                case 'TV':   screen.icon = "display_graph";
                                break;
                                case 'Tablet':   screen.icon = "tablet_graph";
                                break;
                                case 'Desktop':   screen.icon = "display_graph";
                                break;
                            }
                            
                        });
                        var maximumValue = 0 ;
                        if(orderByscreens.length > 0 ){
                            maximumValue =Math.max.apply(Math,orderByscreens);
                        }
                        $scope.details.screens = screens; 
                        $scope.details.screenTop = maximumValue;
                        $scope.details.kpiType = campaign.kpiType.toLowerCase();
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
                        var costViewabilitynColors =[];
                            costViewabilitynColors["inventory"] = "#F8810E";
                            costViewabilitynColors["data"] = "#0072BC";
                            costViewabilitynColors["adServing"] = "#45CB41";
                            costViewabilitynColors["other"] = "#BFC3D1";
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
            //$scope.details.pieChart = pieChart.highChart();
            //$scope.details.solidGaugeChart = solidGaugeChart.highChart();
            //API call for campaign chart
            dataService.getCdbChartData(campaign, 'life_time', 'campaigns', null).then(function (result) {
                var lineData = [], showExternal = true;
                if (result.status == "success" && !angular.isString(result.data)) {
                    if (!angular.isUndefined($scope.campaign.kpiType)) {
                        if (result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            var kpiType = ($scope.campaign.kpiType), kpiTypeLower = angular.lowercase(kpiType);
                            for (var i = 0; i < maxDays.length; i++) {
                                maxDays[i]['ctr'] *= 100;
				maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate * 100;
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }
                            $scope.details.lineData = lineData;
                            $timeout(function() {
                                $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data , 480, 330, null, undefined, showExternal);
                            },3000);
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
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'view_report_for_strategy', loginModel.getLoginName());
            document.location = '#/performance';
        };

        $scope.setOptimizationData = function( campaign, action, strategyByActionId){

            campaignSelectModel.setSelectedCampaign(campaign);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);

            var _selectedStrategy = {
                id : strategyByActionId[action.id].lineitemId ,
                name :  strategyByActionId[action.id].lineItemName
            };

            strategySelectModel.setSelectedStrategy(_selectedStrategy);

            var actionData ={
                selectedAction : action ,
                selectedActionItems : activityList.data.data
            };
            // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just fetch strategy list and retain selected strategy.
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED, actionData );

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
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED, actionData );
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'view_activity_for_strategy', loginModel.getLoginName());
            document.location = '#/optimization';
        };

        $scope.setGraphData = function(campaign, type){

            campaignSelectModel.setSelectedCampaign(campaign);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);

            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, (type === 'view_report' ? type : type + '_widget'), loginModel.getLoginName());

            if(type === 'cost'){
                utils.goToLocation('/cost');
            } else if(type === 'viewability'){
                utils.goToLocation('/viewability');
	        } else if(type === 'inventory') {
		        utils.goToLocation('/inventory');
            } else if(type === 'view_report' || type === 'format' || type == 'screens') {
		        utils.goToLocation('/performance');
	        }else{
                utils.goToLocation('/#/optimization');
            }

        };

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;


        $scope.watchActionFilter = function(filter, showExternal) {
            $scope.activityLogFilterByStatus = showExternal;
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 480, 330 , null, undefined, showExternal);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'activity_log_' + (showExternal ? 'external' : 'all'), loginModel.getLoginName());
            return filter;
        };

        /*Single Campaign UI Support elements - starts */ 

         $scope.getSpendDifference = function(campaign) {
            if(campaign !== undefined) {
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
            if(campaign !== undefined) {
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
            if(campaign !== undefined) {
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
            var spendDifference = 0;
            if (expected == 0) {
                spendDifference = 0;
            } else {
                spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2)
            }
            return spendDifference;
        }
        $scope.getSpendDiffForStrategy = function(strategy) {
            if (strategy == undefined) {
                return 0;
            }
            var expectedSpend = strategy.expectedMediaCost;
            return $scope.getPercentDiff(expectedSpend, strategy.grossRev)
        }
        $scope.getSpendTotalDifferenceForStrategy = function(strategy) {
            if(campaign !== undefined) {
                var spendDifference = 0;
                
                var spend = strategy.grossRev;
                var totalSpend = strategy.totalMediaCost;
                return $scope.getSpendDiffForStrategy(totalSpend, spend);
            }
        };
        $scope.getSpendClass = function(campaign) {
            if(campaign !== undefined) {
                var spendDifference = $scope.getSpendDifference(campaign);
                return $scope.getClassFromDiff(spendDifference);
            }
        };
        $scope.getSpendClassForStrategy = function(strategy) {
            var spendDifference = $scope.getSpendDiffForStrategy(strategy);
            return $scope.getClassFromDiff(spendDifference);
        }
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
        }
        $scope.getSpendWidth = function(campaign) {
            if(campaign !== undefined) {
                var actualWidth = 100 + $scope.getSpendTotalDifference(campaign);
                if (actualWidth > 100) {
                    actualWidth = 100;
                }
                return actualWidth;
            }
        }

        $scope.getSpendTickWidth = function(campaign) {
            if(campaign !== undefined) {
                var actualWidth = 100 + $scope.getSpendTickDifference(campaign);
                if (actualWidth > 100) {
                    actualWidth = 100;
                }
                return actualWidth;
            }
        }

         $scope.getSpendWidthForStrategy = function(strategy) {
                    var actualWidth = 100 + $scope.getSpendTotalDifferenceForStrategy(strategy);
                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }
                    return actualWidth;
                }
        /*Single Campaign UI Support elements - sta */ 
        /*Refresh Graph Data */
        $scope.refreshGraph = function(showExternal){
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 480, 330 , null, undefined, showExternal);
        }
        $rootScope.$on("callRefreshGraphData",function(event,args){ 
            $scope.refreshGraph(args);
        });
        $scope.refreshCampaignDetailsPage = function(){
            $rootScope.$broadcast("closeEditActivityScreen");
        }
        $scope.refreshCampaignDetailsPage();
    });

}());
