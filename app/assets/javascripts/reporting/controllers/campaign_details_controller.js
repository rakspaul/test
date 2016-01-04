/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($rootScope, $scope, $routeParams, kpiSelectModel,
                                                            $window, domainReports, timePeriodModel, platformService,
                                                            modelTransformer, campaignCDBData, campaignListService,
                                                            campaignListModel, campaignSelectModel, strategySelectModel,
                                                            actionChart, dataService, apiPaths, actionColors,
                                                            $location, utils, $timeout, pieChart, solidGaugeChart,
                                                            $filter, constants, editAction, activityList, loginModel,
                                                            loginService, brandsModel, analytics, dataStore, urlService,
                                                            momentService, RoleBasedService, advertiserModel , vistoconfig ) {
        var orderBy = $filter('orderBy');
        var campaign = campaignListService;
        var Campaigns = campaignListModel;
        var onCampaignCount = 0;
        $scope.activityLogFlag = false;
        brandsModel.disable();
        $scope.api_return_code = 200;

        $scope.textConstants = constants;
        $scope.isStrategyDropDownShow = false;
        $scope.actionItems = activityList.data;
        $scope.loadingViewabilityFlag = true;
        $scope.loadingVideoViewabilityFlag = true;
        $scope.loadingCostBreakdownFlag = true;
        $scope.loadingFormatFlag = true;
        $scope.loadingInventoryFlag = true;
        $scope.loadingScreenFlag = true;
        $scope.loadingPlatformFlag = true;
        $scope.loadingAdSizeFlag = true;
        $scope.activityLogFilterByStatus = true;

            //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');
        $scope.campaigns = new Campaigns();
        var campaignList = [];
        $scope.details = {
            campaign: null,
            details: null,
            actionChart :true
        };

        $scope.isCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

        $scope.usrRole  = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().ui_exclusions;
        $scope.isLocaleSupportUk = RoleBasedService.getClientRole().i18n && RoleBasedService.getClientRole().i18n.locale === 'en-gb';
        $scope.isWorkFlowUser = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;


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

        $scope.applySortStrategies =  function() {
            var campaignStrategiesData = _.chain($scope.campaign.campaignStrategies).sortBy('name').sortBy($scope.details.sortParam).value();
            $scope.campaign.campaignStrategies = ($scope.details.sortDirection === 'asc') ? campaignStrategiesData : campaignStrategiesData.reverse();
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
            $scope.applySortStrategies();
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, ('sort_' + fieldName + (sortDirection ? sortDirection : '_asc')), loginModel.getLoginName());
        };
        $scope.details.getSortDirection= function(){
            return ($scope.details.sortDirection == "desc")? "false" : "true";
        };
        $scope.setWidgetLoadedStatus = function(){
            $scope.loadingScreenFlag = false;
            $scope.screenTotal = 0;
            //$scope.loadingPlatformFlag = false;
            //$scope.platformTotal = 0;
            $scope.loadingCostBreakdownFlag = false;
            $scope.details.totalCostBreakdown = 0;
            $scope.loadingInventoryFlag = false;
            $scope.loadingViewabilityFlag = false;
            $scope.details.getCostViewability = undefined;
            $scope.getCostViewabilityFlag = 1;
            $scope.details.actionChart = false;
        };
        $scope.setEmptyWidget = function(){
            var chartConfig = {
                    data : '',
                    kpiType : $scope.selectedCampaign.kpi.toUpperCase() || 'NA',
                    showLabel : true
                }
            $scope.platformBarChartConfig = chartConfig;
            $scope.inventoryBarChartConfig =  chartConfig;
            $scope.screenBarChartConfig = chartConfig
            $scope.adSizenBarChartConfig = chartConfig;
            $scope.formatBarChartConfig = chartConfig;
        };
        $scope.details.callStrategiesSorting = function(fieldName,count){
            if(count > 1){
                $scope.details.sortStrategies(fieldName);
            }
        }

        $scope.init = function() {
            if($rootScope.isFromCampaignList == true) {
                var listCampaign = campaignListService.getListCampaign();
                if(angular.isObject(listCampaign)) {
                    var campListCampaign = {
                        id: listCampaign.id,
                        name: listCampaign.name,
                        startDate: listCampaign.start_date,
                        endDate: listCampaign.end_date,
                        kpi: listCampaign.kpi_type
                    };
                    campaignSelectModel.setSelectedCampaign(campListCampaign);
                    campaignListService.setListCampaign('');
                    $location.path("/mediaplans/" + listCampaign.id);
                }
                }
            }
        //init function sets the selected campaign onclick of campaign in campaign list page. CRPT-3440
        $scope.init();

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event){
            $location.path("/mediaplans/" + campaignSelectModel.getSelectedCampaign().id);
        });

        //API call for campaign details
      var clientId = loginModel.getSelectedClient().id;
      var url = apiPaths.apiSerivicesUrl_NEW + "/clients/" + clientId + "/campaigns/" + $routeParams.campaignId;
        dataService.getSingleCampaign(url).then(function(result) {
            if (result.status == "success" && !angular.isString(result.data)) {
                var dataArr = [result.data.data];
                $scope.adFormats = domainReports.checkForCampaignFormat(dataArr[0].adFormats);
                $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'life_time', 'life_time')[0];
                var selectedCampaign = {
                    id : $scope.campaign.id,
                    name : $scope.campaign.name,
                    startDate : $scope.campaign.start_date,
                    endDate : $scope.campaign.end_date,
                    kpi : $scope.campaign.kpi_type.toLowerCase()
                };

                //console.log($scope.adFormats);
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
                campaignSelectModel.setSelectedCampaign(selectedCampaign);

                var _selectedbrandFromModel = brandsModel.getSelectedBrand() ;

                campaign.getStrategiesData(clientId, $scope.campaign, constants.PERIOD_LIFE_TIME);
                updateActionItems($scope.getCdbChartData,1,true);

                campaignListService.getCdbLineChart($scope.campaign ,'life_time', function(cdbData) {
                    if(cdbData) {
                        $scope.campaigns.cdbDataMap[$routeParams.campaignId] = modelTransformer.transform(cdbData, campaignCDBData);
                        $scope.campaigns.cdbDataMap[$routeParams.campaignId]['modified_vtc_metrics'] = campaignListService.vtcMetricsJsonModifier($scope.campaigns.cdbDataMap[$routeParams.campaignId].video_metrics);
                    }
                });

                if($scope.isCostModelTransparent) {
                    $scope.getCostBreakdownData($scope.campaign);
                }
                $scope.getPlatformData();
                $scope.getCostViewabilityData($scope.campaign);
                $scope.getInventoryGraphData($scope.campaign);
                $scope.getFormatsGraphData($scope.campaign);
                $scope.getAdSizeGraphData($scope.campaign);
                $scope.getScreenGraphData($scope.campaign);
            } else {
                if(result.status == 204 && result.data == "" ){
                     //if data not found
                    $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
                    $scope.campaign = _.findWhere(campaignSelectModel, {id: $scope.selectedCampaign.id});
                    $scope.campaign.campaignTitle = $scope.campaign.name;
                   $scope.details = {
                        campaign: null,
                        details: null,
                        actionChart :false
                    };
                    $scope.loadingPlatformFlag = false;
                    $scope.loadingAdSizeFlag = false;
                    $scope.loadingFormatFlag = false;
                    $scope.activityLogFlag = true;
                    $scope.setWidgetLoadedStatus();
                    $scope.setEmptyWidget();
                    $scope.campaign.getSelectedCampaign =campaignSelectModel.getSelectedCampaign;
                    $scope.campaign.durationLeft= campaignSelectModel.durationLeft;
                    $scope.campaign.daysSinceEnded = campaignSelectModel.daysSinceEnded;

                }else{
                    if (result.status ==='error') {
                        $scope.api_return_code = result.data.status;
                    } else {
                        $scope.api_return_code = result.status;
                    }
                    $scope.setWidgetLoadedStatus();

                }

            }
        }, function(result) {
            console.log('call failed');
        });
        //TODO: Performance Chart - Moving to D3
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
                                maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate;

                                //if kpiType is delivery, plot impressions on the graph
                                //picking up impressions from perf bydays data call
                                if(kpiTypeLower === "delivery") {
                                    kpiTypeLower = "impressions";
                                }

                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }
                            $scope.details.lineData = lineData;
                            $scope.details.maxDays =  maxDays;
                           // $timeout(function() {
                                $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data , 450, 330, null, undefined, showExternal);

				                var today = moment(new Date()).format('YYYY-MM-DD');
				                var chartEnd = (today < $scope.campaign.endDate ? today : $scope.campaign.endDate);
                                //D3 chart object for action performance chart
                                $scope.details.lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat($scope.campaign.kpiValue),
                                    kpiType: $scope.campaign.kpiType,
                                    from: 'action_performance',

                                    //for delivery kpi
                                    deliveryData: {
                                      "startDate" : $scope.campaign.startDate,
                                      "endDate" : $scope.campaign.endDate,
                                      "totalDays" :  momentService.dateDiffInDays($scope.campaign.startDate, $scope.campaign.endDate) +1,
                                      "deliveryDays": maxDays.length,
                                      "bookedImpressions": maxDays[maxDays.length-1]['booked_impressions'] //REVIEW: $scope.campaign.total_impressions

                                    },
                                    //customisation
                                    activityList: activityList.data.data,
                                    showExternal: showExternal
                                };

                            //},10000);
                            var activityLocalStorageInfo = JSON.parse(localStorage.getItem('activityLocalStorage'));
                            if(activityLocalStorageInfo !=null){
                                if ((activityLocalStorageInfo.actionSel) !== null) {
                                    $scope.makeCampaignSelected(activityLocalStorageInfo.actionSel);
                                }
                            }

                        }else {
                            $scope.details.actionChart = false;
                        }
                    } else {
                        $scope.details.actionChart = false;
                    }
                } else {
                    $scope.details.actionChart = false;
                }
            });
        };

        var eventActionCreatedFunc = $rootScope.$on(constants.EVENT_ACTION_CREATED, function(event, args) {
            var callbackFunctionName = args.loadingFlag == 2  ?  $scope.refreshGraph : $scope.getCdbChartData;
            dataStore.deleteFromCache(urlService.APIActionData($routeParams.campaignId));
            updateActionItems(callbackFunctionName,args.loadingFlag,args.showExternal);
        });

        function getCustomQueryParams(queryId) {
            return {
                queryId:queryId,
                campaignId: $scope.campaign.orderId,
                clientId:  loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key
            };
        }
        function updateActionItems(callbackCDBGraph,loadingFlag,showExternal) {
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
                /*
                   set 0 = when Add activity no need to do anything
                   set 1 = when page refresh initial graph loading with call back function(getCdbChartData)
                   set 2 = when edit activity just referesh the graph with call back function(refreshGraph)
                */
                switch(loadingFlag) {
                    case 1:
                         callbackCDBGraph && callbackCDBGraph($scope.campaign);
                        break;
                    case 2:
                        callbackCDBGraph && callbackCDBGraph(showExternal);
                        break;
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
                    morDataLen = moreData.length,
                    //requesting strategy card data
                    newStrategyData = campaign.requestStrategiesData($scope.campaign, constants.PERIOD_LIFE_TIME, moreData),
                    tmpCampaignStrategiesArr = [];

                for (var len = 0; len < morDataLen; len++) {
                    tmpCampaignStrategiesArr.push(newStrategyData[len]);
                }
                //TODO: optimising this after introducing pagination
                //$scope.campaign.campaignStrategies = tmpCampaignStrategiesArr;
                $scope.campaign.campaignStrategies.push.apply($scope.campaign.campaignStrategies,tmpCampaignStrategiesArr);
                //$scope.campaign.campaignStrategies.apply();
            }
            //$scope.applySortStrategies();
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

                        //create object for paginated data and request cdb and metric data
                        var newTacticData = campaign.requestTacticsData(campaignStrategies[i], constants.PERIOD_LIFE_TIME, $scope.campaign, moreData);
                        var tmpstrategyTacticsArr = [];
                        for (var len = 0; len < moreDataLen; len++) {
                            //update tactic model
                            $scope.campaign.campaignStrategies[i].strategyTactics.push(newTacticData[len]);
                        }
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

        $scope.getCostBreakdownData  = function(campaign){ //get cost break down data
            var costData, other = 0, sum,cBreakdownChart = [];
            var params = {
                queryId: 14, //cost_report_for_one_or_more_campaign_ids
                clientId: loginModel.getSelectedClient().id,
                campaignIds: campaign.orderId,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key
            }
            var url = urlService.APIVistoCustomQuery(params);
            dataService.fetch(url).then(function(result) {
                $scope.loadingCostBreakdownFlag = false;
                if (result.status == "success" && !angular.isString(result.data)) {
                     if(result.data.data.length>0){
                        costData = result.data.data[0];
                         sum = costData.inventory_cost_pct + costData.data_cost_pct + costData.ad_serving_cost_pct;
                         if (sum < 100) {
                             other = 100 - sum;
                         }
                         $scope.getCostBreakdownInfo = [
                             {
                                 name: 'Inventory',
                                 value: costData.inventory_cost_pct,
                                 className: 'color1',
                                 colorCode: '#F8810E'
                             },
                             {
                                 name: 'Data',
                                 value: costData.data_cost_pct,
                                 className: 'color2',
                                 colorCode: '#0072BC'
                             },
                             {
                                 name: 'Ad Serving',
                                 value: costData.ad_serving_cost_pct,
                                 className: 'color3',
                                 colorCode: '#45CB41'
                             },
                             {name: 'Other', value: other, className: 'color4', colorCode: '#BFC3D1'}
                         ];
                         $scope.details.totalCostBreakdown = costData.total;
                         $scope.order = function (predicate, reverse) {
                             $scope.costBreakdownChartInfo = orderBy($scope.getCostBreakdownInfo, predicate, reverse);
                         };
                         $scope.order('-value', false);
                         var cBreakdownChartColors = [],cBreakdownChartData = [];
                         _.each($scope.costBreakdownChartInfo, function (data, key) {
                            if(data.name !='Other'){
                                 cBreakdownChartColors.push(data.colorCode);
                                 cBreakdownChartData.push(data.value);
                            }
                         });
                         //Put Others as Last
                        var findOthers = _.findWhere($scope.costBreakdownChartInfo, {name: 'Other'});
                        cBreakdownChartColors.push(findOthers.colorCode);
                        cBreakdownChartData.push(findOthers.value);
                         if(costData.cost_transparency === false) {
                             $scope.isCostModelTransparent = false;
                         }
                         //set Up configuration for Cost breakdown chart
                         $scope.costBreakDownPieChartConfig = {data:cBreakdownChartData,width:108,height:108,widgetId:'costBreakdownWidget',colors:cBreakdownChartColors};

                     }
                }
            },function(result){
                console.log('cost break down call failed');
            });
        };

        $scope.getInventoryGraphData  = function(campaign){
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_INVENTORY_CATEGORIES);
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                $scope.loadingInventoryFlag = false;
                var kpIType = kpiSelectModel.selectedKpi === 'delivery' ? 'impressions' : kpiSelectModel.selectedKpi;
                kpIType = kpIType.toLowerCase();

                if (result.status == "success" && !angular.isString(result.data)) {
                    var inventoryData;
                    $scope.chartDataInventory = [];
                    if ((result.data.data[0] !== undefined) && (result.data.data[0] !== null) && (result.data.data.length > 0 ))
                        inventoryData = result.data.data;
                    if (inventoryData && inventoryData.length > 0) {
                        var sortedData = _.sortBy(inventoryData, kpIType); // This Sorts the Data order by CTR or CPA
                        sortedData = (kpIType.toLowerCase() === 'cpa' || kpIType.toLowerCase() === 'cpm' || kpIType.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                        sortedData = _.sortBy(sortedData, function(obj) { return obj[kpIType] == 0 });
                        sortedData  = sortedData.slice(0, 3);

                        _.each(sortedData, function(data, idx) {
                            var kpiData;
                            if(kpIType === 'vtc')
                                kpiData=data.vtc_100;
                            else {
                                kpiData=data[kpIType]
                            }
                            if(kpIType.toLowerCase() === 'ctr' || kpIType.toLowerCase() === 'action_rate' || kpIType.toLowerCase() === 'action rate'){
                                kpiData = parseFloat(kpiData.toFixed(4));
                            } else if(kpIType.toLowerCase() === 'cpm' || kpIType.toLowerCase() === 'cpc' || kpIType.toLowerCase() === 'vtc'){
                                kpiData = parseFloat(kpiData.toFixed(2));
                            }
                            $scope.chartDataInventory.push({'gross_env' : '' , className : '', 'icon_url' : '', 'type' : data.dimension, 'value' : kpiData});
                        });
                    }
                }
                $scope.inventoryBarChartConfig = {
                    data : $scope.chartDataInventory,
                    kpiType : kpIType || 'NA',
                    showLabel : true,
                    graphName : 'inventory'
                }

            },function(result){
                console.log('inventory data call failed');
            });
        };

            // Screen Widget Start
        $scope.getScreenGraphData  = function(campaign){
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_SCREENS);
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                $scope.loadingScreenFlag = false;
                var kpiModel = kpiSelectModel.selectedKpi === 'delivery' ? 'impressions' : kpiSelectModel.selectedKpi;
                if (result.status == "success" && !angular.isString(result.data)) {
                    var screensData;
                    $scope.chartDataScreen = [];
                    var screenResponseData = result.data.data;
                    var adFormats = domainReports.checkForCampaignFormat(result.data.data[0].adFormats);
                    var hasVideoAds = adFormats && kpiModel.toLowerCase() === 'vtc' && !adFormats.videoAds; //for a vedio campaign, if set(default) kPI is vtc and dosen’t have video data. we are showing data not found.
                    if (screenResponseData && screenResponseData.length > 0 && !hasVideoAds) {
                        screensData = _.filter(screenResponseData, function(obj) { return obj.dimension.toLowerCase() != 'unknown'});
                        var sortedData = _.sortBy(screensData, kpiModel); // This Sorts the Data order by CTR or CPA
                        sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm' || kpiModel.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                        sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                        sortedData  = sortedData.slice(0, 3);


                        var screenTypeMap = {
                            'desktop'     : vistoconfig.ICON_DESKTOP ,
                            'unknown'     : vistoconfig.ICON_HELP    ,
                            'smartphone'  : vistoconfig.ICON_MOBILE  ,
                            'mobile'      : vistoconfig.ICON_MOBILE  ,
                            'tv'          : vistoconfig.ICON_DESKTOP ,
                            'set-top box' : vistoconfig.ICON_DESKTOP ,
                            'tablet'      : vistoconfig.ICON_TABLET  ,
                            'other'       : vistoconfig.ICON_IMAGE   ,
                            'display'     : vistoconfig.ICON_DESKTOP ,
                            'DISPLAY'     : vistoconfig.ICON_DESKTOP
                        }

                        _.each(sortedData, function(data, idx) {
                            var kpiData = (kpiModel === 'ctr') ? (data[kpiModel] * 100) : data[kpiModel];
                            var screenType = data.dimension.toLowerCase();
                            $scope.chartDataScreen.push({'gross_env' : data.gross_rev, className : screenTypeMap[screenType], 'icon_url' : '', 'type' : data.dimension, 'value' : kpiData});
                        });
                    }
                }

                $scope.screenBarChartConfig = {
                    data : $scope.chartDataScreen,
                    kpiType : kpiModel || 'NA',
                    graphName : 'screens'
                }
            },function(result){
                console.log('screen data call failed');
            });
        };
        // Screen Widget Ends

        // Screen Widget Start
        $scope.getAdSizeGraphData  = function(campaign){
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_AD_SIZES);
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                $scope.loadingAdSizeFlag = false;
                var kpiModel = kpiSelectModel.selectedKpi === 'delivery' ? 'impressions' : kpiSelectModel.selectedKpi;
                if (result.status == "success" && !angular.isString(result.data)) {
                    var adSizeData;
                    $scope.chartDataAdSize = [];
                    var adSizeResponseData = result.data.data;
                    var adFormats = domainReports.checkForCampaignFormat(result.data.data[0].adFormats);
                    var hasVideoAds = kpiModel.toLowerCase() === 'vtc' && !adFormats.videoAds; //for a vedio campaign, if set(default) kPI is vtc and dosen’t have video data. we are showing data not found.
                    if (adSizeResponseData && adSizeResponseData.length > 0 && !hasVideoAds) {
                        adSizeData = adSizeResponseData;
                        var sortedData = _.sortBy(adSizeData, kpiModel); // This Sorts the Data order by CTR or CPA
                        sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm' || kpiModel.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                        sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                        sortedData  = sortedData.slice(0, 3);
                        _.each(sortedData, function(data, idx) {
                            var kpiData = (kpiModel === 'ctr') ? (data[kpiModel] * 100) : data[kpiModel];
                            var screenType = data.dimension.toLowerCase();
                            $scope.chartDataAdSize.push({'gross_env' : data.gross_rev, className : '', 'icon_url' : '', 'type' : data.dimension.toLowerCase(), 'value' : kpiData});
                        });


                    }
                }

                $scope.adSizenBarChartConfig = {
                    data : $scope.chartDataAdSize,
                    kpiType : kpiModel || 'NA',
                    showLabel : true,
                    graphName : 'adsizes'
                }
            },function(result){
                console.log('screen data call failed');
            });
        };
        // Screen Widget Ends

        // Platform Widget Starts
        $scope.getPlatformData =  function() {
            var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_PLATFORMS);
            // Set default api return code 200
            $scope.api_return_code = 200;
            var kpiModel = kpiSelectModel.selectedKpi === 'delivery' ? 'impressions' : kpiSelectModel.selectedKpi;
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                $scope.loadingPlatformFlag = false;
                $scope.chartDataPlatform = [];
                $scope.chartData = [];
                if ((result.status === "OK" || result.status === "success") && !angular.isString(result.data)) {
                    var kpiData, chartData, resultData = result.data.data, sortedData; // Step 2 Data Mod Restructure of the Array on memory
                    // TODO: Get the formats from ad groups meta response
                    var adFormats = domainReports.checkForCampaignFormat(result.data.data.adFormats);
                    var hasVideoAds = kpiModel.toLowerCase() === 'vtc' && !adFormats.videoAds; //for a vedio campaign, if set(default) kPI is vtc and dosen’t have video data. we are showing data not found.
                    if(resultData && !hasVideoAds) {
                        sortedData = _.sortBy(resultData, kpiModel); // This Sorts the Data order by CTR or CPA
                        sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm' || kpiModel.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                        sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                        sortedData  = sortedData.slice(0, 3);

                        _.each(sortedData, function(data, idx) {
                            kpiData = (kpiModel === 'ctr') ? (data[kpiModel] * 100) : data[kpiModel];
                            var type = data.platform_name;
                            var icon_url = data.platform_icon_url == 'Unknown' ? 'platform_logo.png' : type.toLowerCase().replace(/ /g, '_') + '.png';
                            icon_url = '/assets/images/platform_favicons/' + icon_url;
                            $scope.chartDataPlatform.push({'gross_env': data.gross_rev, 'className': '', 'icon_url': icon_url, 'type': type, 'value': kpiData});
                        });
                    }
                }
                $scope.platformBarChartConfig = {
                    data : $scope.chartDataPlatform,
                    kpiType : kpiModel || 'NA',
                    showLabel : true,
                    graphName : 'platforms'
                }
            }, function() {
                console.log('Platform data call failed');
            });
        };
        // Platform Widget Ends

        $scope.getFormatsGraphData  = function(campaign){
            var formats;
            
            var formatTypeMap = {
                'desktop'     : vistoconfig.ICON_DESKTOP ,
                'unknown'     : vistoconfig.ICON_HELP    ,
                'smartphone'  : vistoconfig.ICON_MOBILE  ,
                'mobile'      : vistoconfig.ICON_MOBILE  ,
                'tv'          : vistoconfig.ICON_DESKTOP ,
                'set-top box' : vistoconfig.ICON_DESKTOP ,
                'tablet'      : vistoconfig.ICON_TABLET  ,
                'other'       : vistoconfig.ICON_IMAGE   ,
                'display'     : vistoconfig.ICON_DESKTOP ,
                'DISPLAY'     : vistoconfig.ICON_DESKTOP
            }
            
            
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_FORMATS);
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                $scope.loadingFormatFlag = false;
                var kpiModel = kpiSelectModel.selectedKpi === 'delivery' ? 'impressions' : kpiSelectModel.selectedKpi;
                if (result.status == "success" && !angular.isString(result.data)) {
                    var formatData;
                    $scope.chartDataFormat = [];
                    var formatResponseData = result.data.data;
                    var adFormats = domainReports.checkForCampaignFormat(result.data.data[0].adFormats);
                    var hasVideoAds = kpiModel.toLowerCase() === 'vtc' && !adFormats.videoAds;//for a vedio campaign, if set(default) kPI is vtc and dosen’t have video data. we are showing data not found.
                    if (formatResponseData && formatResponseData.length > 0 && !hasVideoAds) {
                        formatData = _.filter(formatResponseData, function(obj) { return obj.dimension.toLowerCase() != 'unknown' });
                        var sortedData = _.sortBy(formatData, kpiModel); // This Sorts the Data order by CTR or CPA
                        sortedData = (kpiModel.toLowerCase() === 'cpa' || kpiModel.toLowerCase() === 'cpm' || kpiModel.toLowerCase() === 'cpc') ? sortedData : sortedData.reverse();
                        sortedData = _.sortBy(sortedData, function(obj) { return obj[kpiModel] == 0 });
                        sortedData  = sortedData.slice(0, 3);
                        _.each(sortedData, function(data, idx) {
                            var kpiData = (kpiModel === 'ctr') ? (data[kpiModel] * 100) : data[kpiModel];
                            var screenType = data.dimension.toLowerCase();
                            $scope.chartDataFormat.push({'gross_env' : data.gross_rev, className : formatTypeMap[screenType], 'icon_url' : '', 'type' : data.dimension.toLowerCase(), 'value' : kpiData});
                        });
                    }
                }

                $scope.formatBarChartConfig = {
                    data : $scope.chartDataFormat,
                    kpiType : kpiModel || '',
                    graphName : 'formats'
                }
            },function(result){
                console.log('formats data call failed');
            });
        };

        $scope.getCostViewabilityData  = function(campaign){
            var viewabilityData, viewData;
             //get cost break down data
             $scope.getCostViewabilityFlag = 0;
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_QUALITY);
            dataService.fetch(urlService.APIVistoCustomQuery(params)).then(function (result) {
                 $scope.getCostViewabilityFlag = 1;
                 $scope.loadingViewabilityFlag = false;
                if (result.status == "success" && !angular.isString(result.data.data)) {
                        viewData = result.data.data;
                        $scope.details.getCostViewability = {
                            pct_display : viewData.view_metrics.viewable_imps_perc,
                            pct_video : viewData.view_metrics.video_viewability_metrics.video_viewable_perc,
                            pct_total : viewData.view_metrics.viewable_imps_perc > viewData.view_metrics.video_viewability_metrics.video_viewable_perc ? viewData.view_metrics.viewable_imps_perc : viewData.view_metrics.video_viewability_metrics.video_viewable_perc
                        };

                    var highChartSeriesObj = [];
                    if($scope.details.getCostViewability.pct_video >0 && $scope.details.getCostViewability.pct_display >0) {
                        highChartSeriesObj.push({ innerRadius: '85%', data: [{y:$scope.details.getCostViewability.pct_video, color:'#45CB41'}], radius: '70%'});
                        highChartSeriesObj.push({innerRadius: '100%', radius: '85%',data: [{y:$scope.details.getCostViewability.pct_display, color:'#008ED5'}]});
                    }

                    if($scope.details.getCostViewability.pct_video === 0 && $scope.details.getCostViewability.pct_display >0) {
                        highChartSeriesObj.push({innerRadius: '100%', radius: '85%',data: [{y:$scope.details.getCostViewability.pct_display, color:'#008ED5'}]});
                    }

                    if($scope.details.getCostViewability.pct_video > 0 && $scope.details.getCostViewability.pct_display === 0) {
                        highChartSeriesObj.push({innerRadius: '100%', radius: '85%',data: [{y:$scope.details.getCostViewability.pct_video, color:'#45CB41'}]});
                    }
                    highChartSeriesObj.push({innerRadius: '101', data: [{y:$scope.details.getCostViewability.pct_total, color:'#000000'}]});
                    highChartSeriesObj.push({ innerRadius: '103', radius: '102%',data: [{y:100, color:'#FFFFFF'}]});
                    $scope.details.getCostViewability.highChartSeriesObj = highChartSeriesObj;
                    $timeout(function(){
                            $scope.details.solidGaugeChart=solidGaugeChart.highChart($scope.details.getCostViewability);
                        });
                }
            },function(result){
                console.log('cost viewability call failed');
            });
        };

        $scope.viewReports = function(campaign, strategy){
            campaignSelectModel.setSelectedCampaign(campaign);
            strategySelectModel.setSelectedStrategy(strategy);
            kpiSelectModel.setSelectedKpi(campaign.kpiType);

            // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just fetch strategy list and retain selected strategy.
            localStorage.setItem('isNavigationFromCampaigns', true);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'view_report_for_strategy', loginModel.getLoginName());
            utils.goToLocation('/performance');
        };

        $scope.getMessageForDataNotAvailable = function (campaign,dataSetType) {
            campaign = campaign || $scope.campaign;
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
                return constants.MSG_CAMPAIGN_NOT_OPTIMIZED;
            } else if (dataSetType == 'inventory' || dataSetType == 'viewability'){
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
            utils.goToLocation('/optimization');
        };
        $scope.setReportMenu = function(){
            $rootScope.$broadcast("callSetDefaultReport","Optimization Impact");
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
            utils.goToLocation('/optimization');
        };

        $scope.setGraphData = function(campaign, type){
            if (campaign) {
                campaign.type = type;
                campaignSelectModel.setSelectedCampaign(campaign);
                strategySelectModel.setSelectedStrategy(constants.ALL_STRATEGIES_OBJECT);
                kpiSelectModel.setSelectedKpi(campaign.kpiType);
            }
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
            analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, (type === 'view_report' ? type : type + '_widget'), loginModel.getLoginName());
            if (type === 'cost') {
                utils.goToLocation('/cost');
            } else if (type === 'quality' || type === 'videoViewability') {
                utils.goToLocation('/quality');
            } else if (type === 'inventory') {
                utils.goToLocation('/inventory');
            } else if (type === 'platform') {
                utils.goToLocation('/platform');
            } else if (type === 'view_report' || type === 'formats' || type == 'screens' || type == 'adsizes') {
                utils.goToLocation('/performance');
            } else {
                utils.goToLocation('/optimization');
            }
        };

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;

        $scope.watchActionFilter = function(filter, showExternal) {
            $scope.activityLogFilterByStatus = showExternal;
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 450, 330 , null, undefined, showExternal);
            //TODO: reset D3 action performance chart here
            //D3 chart object for action performance chart
            $scope.details.lineChart = {
                data: $scope.details.lineData,
                kpiValue: parseFloat($scope.campaign.kpiValue),
                kpiType: $scope.campaign.kpiType,
                from: 'action_performance',
                deliveryData: {
                    "startDate" : $scope.campaign.startDate,
                    "endDate" : $scope.campaign.endDate,
                    "totalDays" :  momentService.dateDiffInDays($scope.campaign.startDate, $scope.campaign.endDate) +1,
                    "deliveryDays": $scope.details.maxDays.length,
                    "bookedImpressions": $scope.details.maxDays[$scope.details.maxDays.length-1]['booked_impressions'] //REVIEW: $scope.campaign.total_impressions

                },
                //customisation
                activityList: activityList.data.data,
                showExternal: showExternal
            };

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
                return $scope.getClassFromDiff(spendDifference,campaign.end_date);
            }
        };
        $scope.getSpendClassForStrategy = function(strategy) {
            var spendDifference = $scope.getSpendDiffForStrategy(strategy);
            return $scope.getClassFromDiff(spendDifference,strategy.endDate);
        };

        $scope.getClassFromDiff = function(spendDifference,endDate) {
            if (endDate != undefined) {
                var dateDiffInDays = momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), endDate);
            }
            if (spendDifference == -999) { //fix for initial loading
                return '';
            }
            if(endDate != undefined) {
                if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) == false) {
                    if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                        return 'red';
                    }else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
                        return 'blue';
                    }
                }

                //  past a campaign end date
                if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) == true) {
                    return (spendDifference < -5 || spendDifference > 5) ? 'red' : 'blue';
                }
            }
            if (spendDifference < -10 || spendDifference > 20) {
                return 'red';
            } else if (spendDifference >= -10 && spendDifference <= 20) {
                return 'blue';
            }
            return 'red';
        }

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
          //TODO: move to D3
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, activityList.data.data, 450, 330 , null, undefined, showExternal);

            $scope.details.lineChart = {
                data: $scope.details.lineData,
                kpiValue: parseFloat($scope.campaign.kpiValue),
                kpiType: $scope.campaign.kpiType,
                from: 'action_performance',
                deliveryData: {
                    "startDate" : $scope.campaign.startDate,
                    "endDate" : $scope.campaign.endDate,
                    "totalDays" :  momentService.dateDiffInDays($scope.campaign.startDate, $scope.campaign.endDate) +1,
                    "deliveryDays": $scope.details.maxDays.length,
                    "bookedImpressions": $scope.details.maxDays[$scope.details.maxDays.length-1]['booked_impressions'] //REVIEW: $scope.campaign.total_impressions

                },
                //customisation
                activityList: activityList.data.data,
                showExternal: showExternal
            };
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

        $(document).ready(function() {
            $('.carousel a.left').hide();
            /*if(RoleBasedService.getUserRole().locale === 'en-gb') {
                $('.carousel a.right').hide();
            }*/
            var ItemsShown = 4;
            var nextIndex;
            var prevIndex;
            $('.carousel a.right').click(function(){
                if($('.carousel .item').length === 8) {
                    nextIndex = ItemsShown;
                } else {
                    nextIndex = $('.carousel .item').length  - ItemsShown;
                }
                $('.carousel .item').slice(0,nextIndex).removeClass('active');
                $('.carousel .item').slice(nextIndex).addClass('active');
                $('.carousel a.right').hide();
                $('.carousel a.left').show();
            });
            $('.carousel a.left').click(function(){
                if($('.carousel .item').length === 8) {
                    prevIndex = ItemsShown;
                } else {
                    prevIndex = $('.carousel .item').length - nextIndex;
                }
                $('.carousel .item').slice('-'+prevIndex).removeClass('active');
                $('.carousel .item').slice(0,prevIndex).addClass('active');
                $('.carousel a.right').show();
                $('.carousel a.left').hide();
            });

            // hot fix for the enabling the active link in the reports dropdown
            setTimeout(function(){
                $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ;
                $(".main_navigation").find("#reports_overview_tab").addClass("active_tab") ;
            }, 200);
            // end of hot fix for the enabling the active link in the reports dropdown

        });

    }).run(function($rootScope,$route){
        $rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
        var prevUrl = absOldUrl.substring(absOldUrl.lastIndexOf('/'));
        var paramsObj = $route.current.params;
        if((prevUrl =='/campaigns') && (absNewUrl != '/campaigns')) {
            $rootScope.isFromCampaignList = true;
        } else {
            $rootScope.isFromCampaignList = false;
        }
    });});
}());
