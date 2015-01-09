/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($rootScope, $scope, $routeParams, modelTransformer, campaignCDBData, campaignListService, campaignListModel, actionChart, dataService, apiPaths, actionColors, utils, dataTransferService, $timeout, pieChart, solidGaugeChart, $filter, constants, editAction, activityList) {

        var campaign = campaignListService;
        var Campaigns = campaignListModel;
        $scope.actionItems = activityList.data;

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');

        $scope.campaigns = new Campaigns();
        $scope.is_network_user = is_network_user;
        var campaignList = [];
        $scope.details = {
                campaign: null,
                details: null,
                actionChart :true
            };

        $scope.details.sortParam = 'startDate';
        $scope.details.sortDirection = 'asc';
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
 
        };
        $scope.details.getSortDirection= function(){
            return ($scope.details.sortDirection == "desc")? "true" : "false";
        };


        //API call for campaign details
//        var url = "/campaigns/" + $routeParams.campaignId + ".json?filter[date_filter]=life_time";
        var url = apiPaths.apiSerivicesUrl + "/campaigns/" + $routeParams.campaignId + "?user_id=" + user_id;

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
                $scope.getFormatsGraphData($scope.campaign);
            }
        }, function(result) {
            console.log('call failed');
        });
        var actionUrl = apiPaths.apiSerivicesUrl + "/reports/campaigns/" + $routeParams.campaignId + "/actions?user_id="+user_id;
        dataService.getActionItems(actionUrl).then(function(result) {
            var actionItemsArray = [] , counter = 0;   
            var actionItems = result.data.data;
            var strategyByActionId = {};
            if (actionItems.length > 0) {
                for(var i = actionItems.length-1; i >= 0; i--){
                    for(var j = actionItems[i].action.length - 1; j >= 0; j--){
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
            }
        }, function(result) {
            console.log('call failed');
        });

       

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
                        var costBreakdownColors =[];
                            costBreakdownColors["inventory"] = "#F8810E";
                            costBreakdownColors["data"] = "#0072BC";
                            costBreakdownColors["adServing"] = "#45CB41";
                            costBreakdownColors["other"] = "#BFC3D1";
                        $scope.details.totalCostBreakdown = costData.total;
                        $timeout(function(){
                             $scope.details.pieChart=pieChart.highChart($scope.details.getCostBreakdown, costBreakdownColors);
                         });
                     }
                }
            },function(result){
                console.log('cost break down call failed');
            });
        };

        $scope.getInventoryGraphData  = function(campaign){
            var inventory;
            dataService.getCostInventoryData($scope.campaign,'life_time').then(function(result) {
                if (result.status == "success" && !angular.isString(result.data)) {
                    if(result.data.data.length>0){
	                   if(campaign.kpiType.toLowerCase() == 'ctr' || campaign.kpiType.toLowerCase() == 'vtc') {
                            inventory=_.chain(result.data.data[0].inv_metrics)
                            .sortBy(function(inventory){ return inventory.kpi_value; })
                            .reverse()
                            .first(3)
                            .value();
                            _.each(inventory, function(inv) {
                                inv.kpi_value *= 100;
                            });
                    }else {
                        inventory=_.chain(result.data.data[0].inv_metrics)
                        .sortBy(function(inventory){ return inventory.kpi_value; })
                        .first(3)
                        .value();
		             }
                    $scope.details.inventoryTop = _.first(inventory);
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
                if (result.status == "success" && !angular.isString(result.data)) {
            	    for (var i = 0; i < result.data.data.length; i++) {
            		  result.data.data[i].ctr *= 100;
            		  result.data.data[i].vtc = result.data.data[i].video_metrics.vtc_rate * 100;
            	    }
                    if(result.data.data.length>0){
                        formats=_.chain(result.data.data)
                                .sortBy(function(format){ return format[campaign.kpiType.toLowerCase()]; })
                                .reverse()
                                .value();
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
                        $scope.details.formatTop = _.first(formats); 
                        $scope.details.formatTop = $scope.details.formatTop[campaign.kpiType.toLowerCase()];
                        $scope.details.kpiType = campaign.kpiType.toLowerCase();
                    }
                }
            },function(result){
                console.log('formats data call failed');
            });
        };
        $scope.getCostViewabilityData  = function(campaign){
            var viewabilityData, viewData;
             //get cost break down data
            
            dataService.getCostViewability(campaign,'life_time').then(function(result) {
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
                            $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data , 480, 330, null, undefined, showExternal);

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


        $scope.setOptimizationData = function( campaign, action, strategyByActionId){
            var param = {
                selectedCampaign :campaign,
                selectedStrategy : strategyByActionId[action.id],
                selectedAction : action,
                selectedActionItems : activityList.data.data ,
                navigationFromReports : false
            };

            dataTransferService.initOptimizationData(param);

            utils.goToLocation('/optimization');
        };

        $scope.setActivityButtonData = function( campaign, strategy){
            var param = {
                selectedCampaign :campaign,
                selectedStrategy : strategy,
                selectedAction : undefined,
                selectedActionItems : activityList.data.data 
            };

            dataTransferService.initOptimizationData(param);

            utils.goToLocation('/optimization');
        };

        $scope.setGraphData = function(campaign, type){
            var param = {
                selectedCampaign :campaign
            };

            dataTransferService.initOptimizationData(param);
            if(type == 'cost'){
                utils.goToLocation('/cost');
            }else if(type == 'viewability'){
                utils.goToLocation('/viewability');
	    }else if(type == 'inventory') {
		utils.goToLocation('/inventory');
            }else if(type == 'performance') {
		utils.goToLocation('/performance');
	    }else{
                utils.goToLocation('/optimization');
            }
            
        };

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;


        $scope.watchActionFilter = function(filter, showExternal) {
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 480, 330 , null, undefined, showExternal);
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


    });

}());
