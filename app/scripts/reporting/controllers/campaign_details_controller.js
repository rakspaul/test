define(['angularAMD', 'reporting/timePeriod/time_period_model', 'common/services/transformer_service',
    'reporting/models/campaign_cdb_data', 'reporting/campaignList/campaign_list_service',
    'reporting/campaignList/campaign_list_model', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_service', 'reporting/common/charts/actions',
    'common/services/data_service', 'common/utils', 'reporting/common/charts/pie_chart',
    'reporting/common/charts/solid_gauge', 'common/services/constants_service', 'common/services/features_service',
    'login/login_model', 'login/login_service', 'reporting/brands/brands_model', 'common/services/url_service',
    'common/moment_utils', 'common/services/role_based_service', 'reporting/advertiser/advertiser_model',
    'reporting/kpiSelect/kpi_select_model', 'common/services/data_store_model', 'common/services/vistoconfig_service',
    'reporting/models/domain_reports', 'reporting/editActions/edit_actions_model', 'reporting/models/activity_list',
    'reporting/controllers/actions_controller', 'reporting/editActions/edit_actions_controller',
    'reporting/common/d3/campaign_chart', 'reporting/common/d3/quartiles_graph', 'reporting/directives/strategy_card',
    'reporting/common/d3/pie_chart', 'reporting/advertiser/advertiser_directive', 'reporting/brands/brands_directive'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('CampaignDetailsController', function ($rootScope, $scope, $routeParams,
                                                                $window, $filter,$location,  $timeout,
                                                                timePeriodModel, modelTransformer, campaignCDBData,
                                                                campaignListService, campaignListModel,
                                                                campaignSelectModel, strategySelectModel, actionChart,
                                                                dataService, utils, pieChart, solidGaugeChart,
                                                                constants, featuresService, loginModel, loginService,
                                                                brandsModel, urlService, momentService,
                                                                RoleBasedService, advertiserModel, kpiSelectModel,
                                                                dataStore, vistoconfig, domainReports,
                                                                editAction, activityList) {
            var orderBy = $filter('orderBy'),
                campaign = campaignListService,
                Campaigns = campaignListModel,
                fParams = featuresService.getFeatureParams(),
                getSetCampaignDetails,

                // API call for campaign details
                clientId = loginModel.getSelectedClient().id,

                url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                    '/clients/' + clientId +
                    '/campaigns/' + $routeParams.campaignId,

                eventActionCreatedFunc = $rootScope.$on(constants.EVENT_ACTION_CREATED, function (event, args) {
                    var callbackFunctionName = args.loadingFlag === 2  ?  $scope.refreshGraph : $scope.getCdbChartData;

                    dataStore.deleteFromCache(urlService.APIActionData($routeParams.campaignId));
                    updateActionItems(callbackFunctionName, args.loadingFlag, args.showExternal);
                }),

                callRefreshGraphData = $rootScope.$on('callRefreshGraphData', function (event,args) {
                    $scope.refreshGraph(args);
                });

            function getCustomQueryParams(queryId) {
                var dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);

                return {
                    queryId: queryId,
                    campaignId: $scope.campaign.orderId,
                    clientId: loginModel.getSelectedClient().id,
                    advertiserId: advertiserModel.getSelectedAdvertiser().id,
                    brandId: brandsModel.getSelectedBrand().id,
                    dateFilter: dateFilter
                };
            }

            function updateActionItems(callbackCDBGraph,loadingFlag,showExternal) {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_REPORTS_FOR_OPTIMIZATION_IMPACT);

                if (!$scope.showOptimization) {
                    // don't call the activities api if the user doesn't have permission
                    return;
                }

                params.make_external = false;
                $scope.activityLogFlag = false;

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params), {cache: false})
                    .then(function (result) {
                        var i,
                            j,
                            actionItemsArray,
                            counter,
                            actionItems,
                            strategyByActionId,
                            actionItemsLen;

                        $scope.activityLogFlag = true;

                        if (result.status === 'success') {
                            actionItemsArray = [];
                            counter = 0;
                            actionItems = result.data.data;
                            strategyByActionId = {};
                            actionItemsLen = actionItems.length;

                            if (actionItemsLen > 0) {
                                for (i = actionItemsLen - 1; i >= 0; i--) {
                                    for (j = actionItems[i].action.length - 1; j >= 0; j--) {
                                        actionItems[i].action[j].action_color = vistoconfig.actionColors[counter % 9];
                                        actionItemsArray.push(actionItems[i].action[j]);
                                        strategyByActionId[actionItems[i].action[j].id] = actionItems[i];
                                        counter++;
                                    }
                                }

                                $scope.strategyByActionId = strategyByActionId;
                                activityList.data.data = actionItemsArray;
                            } else {
                                // preventing the model from sharing old data when no activity is present for
                                // other campaigns
                                activityList.data.data = undefined;
                            }
                        } else {
                            // if error
                            activityList.data.data = undefined;
                        }

                        /*
                         set 0 = when Add activity no need to do anything
                         set 1 = when page refresh initial graph loading with call back function (getCdbChartData)
                         set 2 = when edit activity just referesh the graph with call back function (refreshGraph)
                         */
                        switch(loadingFlag) {
                            case 1:
                                callbackCDBGraph && callbackCDBGraph($scope.campaign);
                                break;

                            case 2:
                                callbackCDBGraph && callbackCDBGraph(showExternal);
                                break;
                        }
                    }, function () {
                        console.log('call failed');
                    });
            }

            $rootScope.$on('features', function () {
                var fParams = featuresService.getFeatureParams();

                $scope.createOptimization = fParams[0].optimization_create;
                $scope.showOptimization = fParams[0].optimization_transparency;
            });

            $scope.campaigns = new Campaigns();

            $scope.activityLogFlag = false;
            brandsModel.disable();
            $scope.apiReturnCode = 200;
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

            $scope.details = {
                campaign: null,
                details: null,
                actionChart:true
            };

            $scope.usrRole  = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().uiExclusions;

            $scope.isLocaleSupportUk =
                RoleBasedService.getClientRole().i18n && RoleBasedService.getClientRole().i18n.locale === 'en-gb';

            $scope.isWorkFlowUser = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;
            $scope.details.sortParam = 'startDate';

            // by default is desc...  most recent strategies should display first.
            $scope.details.sortDirection = 'desc';

            $scope.details.toggleSortDirection = function (dir) {
                return (dir === 'asc' ? 'desc': 'asc');
            };

            $scope.showCostWidget = fParams[0].cost;
            $scope.createOptimization = fParams[0].optimization_create;
            $scope.showOptimization = fParams[0].optimization_transparency;

            $scope.details.resetSortParams = function () {
                $scope.details.sortParam = undefined;
                $scope.details.sortDirection = undefined;
            };

            $scope.details.sortIcon = function (fieldName) {
                if ($scope.details.sortParam === fieldName) {
                    return $scope.details.sortDirection === 'asc' ? 'ascending' : 'descending';
                }

                return '';
            };

            $scope.details.sortClass = function (fieldName) {
                return $scope.details.sortParam === fieldName ? 'active': '';
            };

            $scope.applySortStrategies =  function () {
                var campaignStrategiesData =
                    _.chain($scope.campaign.campaignStrategies)
                        .sortBy('name')
                        .sortBy($scope.details.sortParam).value();

                $scope.campaign.campaignStrategies = ($scope.details.sortDirection === 'asc') ?
                    campaignStrategiesData : campaignStrategiesData.reverse();
            };

            $scope.details.sortStrategies = function (fieldName) {
                var sortDirection;

                if ($scope.details.sortParam) {
                    if ($scope.details.sortParam === fieldName) {
                        sortDirection = $scope.details.toggleSortDirection($scope.details.sortDirection);
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
            };

            $scope.details.getSortDirection = function () {
                return ($scope.details.sortDirection === 'desc')? 'false' : 'true';
            };

            $scope.setWidgetLoadedStatus = function () {
                $scope.loadingScreenFlag = false;
                $scope.screenTotal = 0;
                $scope.loadingCostBreakdownFlag = false;
                $scope.details.totalCostBreakdown = 0;
                $scope.loadingInventoryFlag = false;
                $scope.loadingViewabilityFlag = false;
                $scope.details.getCostViewability = undefined;
                $scope.getCostViewabilityFlag = 1;
                $scope.details.actionChart = false;
            };

            $scope.setEmptyWidget = function () {
                var chartConfig = {
                        data: '',
                        kpiType: $scope.selectedCampaign.kpi.toUpperCase() || 'NA',
                        showLabel: true
                    };

                $scope.platformBarChartConfig = chartConfig;
                $scope.inventoryBarChartConfig =  chartConfig;
                $scope.screenBarChartConfig = chartConfig;
                $scope.adSizenBarChartConfig = chartConfig;
                $scope.formatBarChartConfig = chartConfig;
            };

            $scope.details.callStrategiesSorting = function (fieldName, count) {
                if (count > 1) {
                    $scope.details.sortStrategies(fieldName);
                }
            };

            $scope.init = function () {
                var campListCampaign,
                    listCampaign;

                if ($rootScope.isFromCampaignList === true) {
                    listCampaign = campaignListService.getListCampaign();

                    if (angular.isObject(listCampaign)) {
                        campListCampaign = {
                            id: listCampaign.id,
                            name: listCampaign.name,
                            startDate: listCampaign.start_date,
                            endDate: listCampaign.end_date,
                            kpi: listCampaign.kpi_type
                        };

                        campaignSelectModel.setSelectedCampaign(campListCampaign);
                        campaignListService.setListCampaign('');
                        $location.path('/mediaplans/' + listCampaign.id);
                    }
                }
            };

            // init function sets the selected campaign onclick of campaign in campaign list page. CRPT-3440
            $scope.init();

            $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
                $timeout(function () {
                    $scope.$apply(function () {
                        $location.path('/mediaplans/' + campaignSelectModel.getSelectedCampaign().id);
                    });
                }, 0);
            });

            getSetCampaignDetails = function() {
                dataService
                    .getSingleCampaign(url)
                    .then(function (result) {
                        var dataArr,
                            selectedCampaign,
                            params,
                            spendUrl;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            dataArr = [result.data.data];
                            $scope.adFormats = domainReports.checkForCampaignFormat(dataArr[0].adFormats);
                            $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'life_time', 'life_time')[0];

                            selectedCampaign = {
                                id: $scope.campaign.id,
                                name: $scope.campaign.name,
                                startDate: $scope.campaign.start_date,
                                endDate: $scope.campaign.end_date,
                                kpi: $scope.campaign.kpi_type.toLowerCase()
                            };

                            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                            campaignSelectModel.setSelectedCampaign(selectedCampaign);

                            // Fetch Spend Start
                            params = getCustomQueryParams(14);
                            delete params.campaignId;
                            params.campaignIds = $scope.campaign.id;
                            spendUrl = urlService.getCampaignSpend(params);

                            dataService.fetch(spendUrl).then(function(response) {
                                if(response.data){
                                    $scope.campaigns.spend =  response.data.data[0].gross_rev;
                                } else {
                                    $scope.campaigns.spend =  0;
                                }
                            });
                            // Fetch Spend End

                            campaign.getStrategiesData(clientId, $scope.campaign, constants.PERIOD_LIFE_TIME);
                            updateActionItems($scope.getCdbChartData, 1, true);

                            campaignListService.getCdbLineChart($scope.campaign, 'life_time', function (cdbData) {
                                if (cdbData) {
                                    $scope.campaigns.cdbDataMap[$routeParams.campaignId] =
                                        modelTransformer.transform(cdbData, campaignCDBData);
                                    $scope.campaigns.cdbDataMap[$routeParams.campaignId].modified_vtc_metrics =
                                        campaignListService
                                            .vtcMetricsJsonModifier(
                                                $scope.campaigns.cdbDataMap[$routeParams.campaignId].video_metrics
                                            );
                                }
                            });

                            $scope.getCostBreakdownData($scope.campaign);
                            $scope.getPlatformData();
                            $scope.getAdSizeGraphData($scope.campaign);
                            $scope.getScreenGraphData($scope.campaign);
                            $scope.getFormatsGraphData($scope.campaign);
                            $scope.getInventoryGraphData($scope.campaign);
                            $scope.getCostViewabilityData($scope.campaign);
                        } else {
                            if (result.status === 204 && result.data === '' ) {
                                // if data not found
                                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();

                                $scope.campaign = _.findWhere(campaignSelectModel, {
                                    id: $scope.selectedCampaign.id
                                });

                                $scope.campaign.campaignTitle = $scope.campaign.name;

                                $scope.details = {
                                    campaign: null,
                                    details: null,
                                    actionChart:false
                                };

                                $scope.loadingPlatformFlag = false;
                                $scope.loadingAdSizeFlag = false;
                                $scope.loadingFormatFlag = false;
                                $scope.activityLogFlag = true;
                                $scope.setWidgetLoadedStatus();
                                $scope.setEmptyWidget();
                                $scope.campaign.getSelectedCampaign = campaignSelectModel.getSelectedCampaign;
                                $scope.campaign.durationLeft = campaignSelectModel.durationLeft;
                                $scope.campaign.daysSinceEnded = campaignSelectModel.daysSinceEnded;
                            } else {
                                if (result.status ==='error') {
                                    $scope.apiReturnCode = result.data.status;
                                } else {
                                    $scope.apiReturnCode = result.status;
                                }

                                $scope.setWidgetLoadedStatus();
                            }
                        }
                    }, function () {
                        console.log('call failed');
                    });
            };

            $timeout(function(){
                getSetCampaignDetails();
            }, 1000);

            // TODO: Performance Chart - Moving to D3
            $scope.getCdbChartData = function (campaign) {
                // API call for campaign chart
                dataService
                    .getCdbChartData(campaign, 'life_time', 'campaigns', null)
                    .then(function (result) {
                        var lineData = [],
                            showExternal = true,
                            maxDays,
                            kpiType,
                            kpiTypeLower,
                            activityLocalStorageInfo,
                            i;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            if (!angular.isUndefined($scope.campaign.kpiType)) {
                                if (result.data.data.measures_by_days.length > 0) {
                                    maxDays = result.data.data.measures_by_days;
                                    kpiType = ($scope.campaign.kpiType);
                                    kpiTypeLower = kpiType.toLowerCase();

                                    if (kpiTypeLower === 'action rate') {
                                        kpiTypeLower = 'action_rate';
                                    }

                                    for (i = 0; i < maxDays.length; i++) {
                                        maxDays[i].ctr *= 100;
                                        maxDays[i].vtc = maxDays[i].video_metrics.vtc_rate;

                                        lineData.push({
                                            x: i + 1,
                                            y: utils.roundOff(maxDays[i][kpiTypeLower], 2),
                                            date: maxDays[i].date
                                        });
                                    }

                                    $scope.details.lineData = lineData;
                                    $scope.details.maxDays =  maxDays;

                                    $scope.details.actionChart =
                                        actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue),
                                            $scope.campaign.kpiType, activityList.data.data, 450, 330, null,
                                            undefined, showExternal);

                                    // D3 chart object for action performance chart
                                    $scope.details.lineChart = {
                                        data: lineData,
                                            kpiValue: parseFloat($scope.campaign.kpiValue),
                                            kpiType: $scope.campaign.kpiType,
                                            from: 'action_performance',

                                            // for delivery kpi
                                            deliveryData: {
                                                startDate: $scope.campaign.startDate,
                                                endDate: $scope.campaign.endDate,

                                                totalDays: momentService.dateDiffInDays($scope.campaign.startDate,
                                                    $scope.campaign.endDate) + 1,

                                                deliveryDays: maxDays.length,
                                                bookedImpressions: maxDays[maxDays.length-1].booked_impressions
                                        },

                                        // customisation
                                        activityList: activityList.data.data,
                                            showExternal: showExternal
                                    };

                                    activityLocalStorageInfo = JSON.parse(localStorage.getItem('activityLocalStorage'));

                                    if (activityLocalStorageInfo !== null) {
                                        if ((activityLocalStorageInfo.actionSel) !== null) {
                                            $scope.makeCampaignSelected(activityLocalStorageInfo.actionSel);
                                        }
                                    }
                                } else {
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

            // Function called when the user clicks on the Load more button
            $scope.loadMoreStrategies = function () {
                var pageSize = 3,
                    strategiesYetToLoad = $scope.campaign.campaignStrategiesLoadMore,
                    strategiesToLoadNow,
                    newStrategyData;

                if (strategiesYetToLoad.length > 0) {
                    strategiesToLoadNow = strategiesYetToLoad.splice(0, pageSize);

                    newStrategyData = campaign.requestStrategiesData($scope.campaign, constants.PERIOD_LIFE_TIME,
                        strategiesToLoadNow);

                    $scope.campaign.campaignStrategies.push.apply(
                        $scope.campaign.campaignStrategies, newStrategyData
                    );
                }
            };

            $scope.loadMoreTactics = function (strategyId) {
                var pageSize = 3,
                    campaignStrategies = $scope.campaign.campaignStrategies,
                    tacticsYetToLoad,
                    tacticsToLoadNow,
                    newTacticData,

                    strategy = _.find(campaignStrategies, function(s) {
                        return s.id === Number(strategyId);
                    });

                if (!strategy) {
                    return;
                }

                tacticsYetToLoad = strategy.strategyTacticsLoadMore;

                if (tacticsYetToLoad.length > 0) {
                    tacticsToLoadNow = tacticsYetToLoad.splice(0, pageSize);

                    newTacticData = campaign.requestTacticsData(strategy, constants.PERIOD_LIFE_TIME,
                        $scope.campaign, tacticsToLoadNow);

                    strategy.strategyTactics.push.apply(strategy.strategyTactics, newTacticData);
                }
            };

            $scope.makeCampaignSelected = function (id) {
                var splitIdList =  id.split(','),
                    myContainer = $('#action-container:first'),
                    scrollTo,
                    splitIdListLen,
                    i,
                    targetId;

                if (splitIdList && splitIdList.length > 1 ) {
                    scrollTo = $('#actionItem_' + splitIdList[0]);
                    scrollTo.siblings().removeClass('active').end().addClass('active');
                    splitIdListLen = splitIdList.length;

                    for(i = 0; i < splitIdListLen; i++) {
                          targetId = splitIdList[i];
                           myContainer.find('#actionItem_' + targetId).addClass('active');

                           if (scrollTo.length > 0) {
                               myContainer.animate({
                                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                            });
                        }
                    }
                } else {
                    // Day wise single Activity
                    scrollTo = $('#actionItem_' + id);

                    if (scrollTo && scrollTo.length > 0) {
                        scrollTo.siblings().removeClass('active').end().addClass('active');

                        myContainer.animate({
                            scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                        });
                    }
                }
            };

            $scope.getCostBreakdownData  = function (campaign) {
                //  get cost break down data
                var params = getCustomQueryParams(14);

                delete params.campaignId;
                params.campaignIds = campaign.orderId;

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var costData,
                            inventoryCostPercent,
                            sum,
                            dataCostPercent,
                            servingCostPercent,
                            other,
                            cBreakdownChartColors = [],
                            cBreakdownChartData = [],
                            findOthers;

                        $scope.loadingCostBreakdownFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                             if (result.data.data.length > 0) {
                                 costData = result.data.data[0];
                                 inventoryCostPercent = 0;
                                 dataCostPercent = 0;
                                 servingCostPercent = 0;

                                 if (costData.gross_rev > 0.0) {
                                    inventoryCostPercent = costData.inventory_cost * 100 / costData.gross_rev;
                                    dataCostPercent = costData.data_cost * 100 / costData.gross_rev;
                                    servingCostPercent = costData.serving_cost * 100 / costData.gross_rev;
                                 }

                                 sum = inventoryCostPercent + dataCostPercent + servingCostPercent;
                                 other = 0;

                                 if (sum < 100) {
                                     other = 100 - sum;
                                 }

                                 $scope.getCostBreakdownInfo = [
                                     {
                                         name: 'Inventory',
                                         value: inventoryCostPercent,
                                         className: 'color1',
                                         colorCode: '#F8810E'
                                     },

                                     {
                                         name: 'Data',
                                         value: dataCostPercent,
                                         className: 'color2',
                                         colorCode: '#0072BC'
                                     },

                                     {
                                         name: 'Ad Serving',
                                         value: servingCostPercent,
                                         className: 'color3',
                                         colorCode: '#45CB41'
                                     },

                                     {
                                         name: 'Other',
                                         value: other,
                                         className: 'color4',
                                         colorCode: '#BFC3D1'
                                     }
                                 ];

                                 $scope.details.totalCostBreakdown = costData.gross_rev;

                                 $scope.order = function (predicate, reverse) {
                                     $scope.costBreakdownChartInfo =
                                         orderBy($scope.getCostBreakdownInfo, predicate, reverse);
                                 };

                                 $scope.order('-value', false);
                                 cBreakdownChartColors = [];
                                 cBreakdownChartData = [];

                                 _.each($scope.costBreakdownChartInfo, function (data) {
                                    if (data.name !== 'Other') {
                                         cBreakdownChartColors.push(data.colorCode);
                                         cBreakdownChartData.push(data.value);
                                    }
                                 });

                                 //  Put Others as Last
                                 findOthers =
                                     _.findWhere($scope.costBreakdownChartInfo, {name: 'Other'});

                                 cBreakdownChartColors.push(findOthers.colorCode);
                                 cBreakdownChartData.push(findOthers.value);

                                 // set Up configuration for Cost breakdown chart
                                 $scope.costBreakDownPieChartConfig = {
                                     data: cBreakdownChartData,
                                     width: 108,
                                     height: 108,
                                     widgetId: 'costBreakdownWidget',
                                     colors: cBreakdownChartColors
                                 };
                             }
                        }
                    }, function () {
                        console.log('cost break down call failed');
                    });
            };

            $scope.getInventoryGraphData  = function () {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_INVENTORY_CATEGORIES);

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var kpIType = kpiSelectModel.selectedKpi.toLowerCase(),
                            inventoryData,
                            hasVideoAds,
                            sortedData;

                        $scope.loadingInventoryFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            $scope.chartDataInventory = [];

                            if ((result.data.data[0] !== undefined) &&
                                (result.data.data[0] !== null) &&
                                (result.data.data.length > 0 )) {
                                inventoryData = result.data.data;
                            }

                            // for a video campaign, if set(default) kPI is vtc and dosen’t have video data.
                            // we are showing data not found.
                            hasVideoAds = $scope.adFormats && kpIType.toLowerCase() === 'vtc' &&
                                !$scope.adFormats.videoAds;

                            if (inventoryData && inventoryData.length > 0 && !hasVideoAds) {
                                _.each(inventoryData, function (obj) {
                                    obj.vtc = obj.vtc_100;
                                    obj['action rate'] = obj.action_rate;
                                });

                                // This Sorts the Data order by CTR or CPA
                                sortedData = _.sortBy(inventoryData, kpIType);

                                sortedData = _.contains(['cpa', 'cpm', 'cpc'], kpIType) ?
                                    sortedData : sortedData.reverse();

                                sortedData = _.sortBy(sortedData, function (obj) {
                                    return obj[kpIType] === 0;
                                });

                                sortedData  = sortedData.slice(0, 3);

                                $scope.chartDataInventory = _.map(sortedData, function (data) {
                                    var kpiData = data[kpIType];

                                    return {
                                        gross_env: '',
                                        className: '',
                                        icon_url: '',
                                        type: data.dimension,
                                        value: kpiData,
                                        kpiType: kpIType
                                    };
                                });
                            }
                        }

                        $scope.inventoryBarChartConfig = {
                            data: $scope.chartDataInventory,
                            showLabel: true,
                            graphName: 'inventory'
                        };
                    }, function () {
                        console.log('inventory data call failed');
                    });
            };

            // Screen Widget Start
            $scope.getScreenGraphData  = function () {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_SCREENS);

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var kpiModel = kpiSelectModel.selectedKpi,
                            screensDataPerfMtcs,
                            screensData,
                            screenResponseData,
                            hasVideoAds,
                            sortedData;

                        $scope.loadingScreenFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            screensData = [];
                            $scope.chartDataScreen = [];
                            screenResponseData = result.data.data;

                            // for a video campaign, if set(default) kPI is vtc and dosen’t have video data.
                            // we are showing data not found.
                            hasVideoAds = $scope.adFormats && kpiModel.toLowerCase() === 'vtc' &&
                                !$scope.adFormats.videoAds;

                            if (screenResponseData && screenResponseData.length > 0 && !hasVideoAds) {
                                screensDataPerfMtcs = _.filter(screenResponseData,
                                    function (obj) {
                                        return obj.dimension.toLowerCase() !== 'unknown';
                                    });

                                screensData = _.map(screensDataPerfMtcs, function (obj) {
                                    obj.vtc = obj.vtc_100;
                                    obj['action rate'] = obj.action_rate;

                                    return obj;
                                });

                                // This Sorts the Data order by CTR or CPA
                                sortedData = _.sortBy(screensData, kpiModel);

                                sortedData = _.contains(['cpa', 'cpm', 'cpc'], kpiModel) ?
                                    sortedData : sortedData.reverse();

                                sortedData = _.sortBy(sortedData, function (obj) {
                                    return obj[kpiModel] === 0;
                                });

                                sortedData  = sortedData.slice(0, 3);

                                $scope.chartDataScreen = _.map(sortedData, function (data) {
                                    var kpiData = data[kpiModel],
                                        screenType = data.dimension.toLowerCase();

                                    return {
                                        gross_env: data.gross_rev,
                                        className: vistoconfig.screenTypeMap[screenType],
                                        icon_url: '',
                                        type: data.dimension,
                                        value: kpiData,
                                        kpiType: kpiModel
                                    };
                                });
                            }
                        }

                        $scope.screenBarChartConfig = {
                            data: $scope.chartDataScreen,
                            graphName: 'screens'
                        };
                    },function () {
                        console.log('screen data call failed');
                    });
            };
            // Screen Widget Ends

            // Screen Widget Start
            $scope.getAdSizeGraphData  = function () {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_AD_SIZES);

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var kpiModel = kpiSelectModel.selectedKpi,
                            adSizeData,
                            adSizeResponseData,
                            hasVideoAds,
                            sortedData;

                        $scope.loadingAdSizeFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            adSizeData = [];
                            $scope.chartDataAdSize = [];
                            adSizeResponseData = result.data.data;
                            // for a video campaign, if set(default) kPI is vtc and does'nt have video data.
                            // we are showing data not found.
                            hasVideoAds = $scope.adFormats &&
                                kpiModel.toLowerCase() === 'vtc' &&
                                !$scope.adFormats.videoAds;

                            if (adSizeResponseData && adSizeResponseData.length > 0 && !hasVideoAds) {
                                adSizeData = _.map(adSizeResponseData, function (obj) {
                                    obj.vtc = obj.vtc_100;
                                    obj['action rate'] = obj.action_rate;
                                    return obj;
                                });

                                // This Sorts the Data order by CTR or CPA
                                sortedData = _.sortBy(adSizeData, kpiModel);

                                sortedData = _.contains(['cpa', 'cpm', 'cpc'], kpiModel) ?
                                    sortedData : sortedData.reverse();

                                sortedData = _.sortBy(sortedData, function (obj) {
                                    return obj[kpiModel] === 0;
                                });

                                sortedData  = sortedData.slice(0, 3);

                                $scope.chartDataAdSize = _.map(sortedData, function (data) {
                                    var kpiData = data[kpiModel];

                                    return {
                                        gross_env: data.gross_rev,
                                        className: '',
                                        icon_url: '',
                                        type: data.dimension.toLowerCase(),
                                        value: kpiData,
                                        kpiType: kpiModel
                                    };
                                });
                            }
                        }

                        $scope.adSizenBarChartConfig = {
                            data: $scope.chartDataAdSize,
                            showLabel: true,
                            graphName: 'adsizes'
                        };
                    }, function () {
                        console.log('screen data call failed');
                    });
            };
            // Screen Widget Ends

            // Platform Widget Starts
            $scope.getPlatformData =  function () {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_PLATFORMS),
                    kpiModel = kpiSelectModel.selectedKpi;

                // Set default api return code 200
                $scope.apiReturnCode = 200;

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var kpiData,
                            resultData,
                            sortedData,
                            platformData = [],
                            hasVideoAds;

                        $scope.loadingPlatformFlag = false;
                        $scope.chartDataPlatform = [];
                        $scope.chartData = [];

                        if ((result.status === 'OK' || result.status === 'success') &&
                            !angular.isString(result.data)) {
                            // Step 2 Data Mod Restructure of the Array on memory
                            resultData = result.data.data;

                            platformData = [];

                            // for a video campaign, if set(default) kPI is vtc and dosen’t have video data.
                            // we are showing data not found.
                            hasVideoAds = $scope.adFormats && kpiModel.toLowerCase() === 'vtc' &&
                                !$scope.adFormats.videoAds;

                            if (resultData && resultData.length > 0 && !hasVideoAds) {
                                platformData = _.map(resultData, function (obj) {
                                    obj['action rate'] = obj.action_rate;

                                    return obj;
                                });

                                // This Sorts the Data order by CTR or CPA
                                sortedData = _.sortBy(platformData, kpiModel);

                                sortedData = _.contains(['cpa', 'cpm', 'cpc'], kpiModel) ?
                                    sortedData : sortedData.reverse();

                                sortedData = _.sortBy(sortedData, function (obj) {
                                    return obj[kpiModel] === 0;
                                });

                                sortedData = sortedData.slice(0, 3);

                                $scope.chartDataPlatform = _.map(sortedData, function(data) {
                                    var type = data.platform_name,
                                        icon_url = data.platform_icon_url === 'Unknown' ?
                                            'platform_logo.png' :
                                            type.toLowerCase().replace(/ /g, '_') + '.png';

                                    kpiData = data[kpiModel];
                                    icon_url = '/images/platform_favicons/' + icon_url;

                                    return {
                                        gross_env: data.gross_rev,
                                        className: '',
                                        icon_url: icon_url,
                                        type: type,
                                        value: kpiData,
                                        kpiType: kpiModel
                                    };
                                });
                            }
                        }

                        $scope.platformBarChartConfig = {
                            data: $scope.chartDataPlatform,
                            showLabel: true,
                            graphName: 'platforms'
                        };
                    }, function () {
                        console.log('Platform data call failed');
                    });
            };
            // Platform Widget Ends

            $scope.getFormatsGraphData = function () {
                var formatTypeMap = vistoconfig.formatTypeMap,
                    params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_FORMATS);

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var kpiModel = kpiSelectModel.selectedKpi,
                            formatDataPerfMtrcs,
                            formatData,
                            formatResponseData,
                            hasVideoAds,
                            sortedData;

                        $scope.loadingFormatFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data)) {
                            formatData = [];
                            $scope.chartDataFormat = [];
                            formatResponseData = result.data.data;

                            // for a video campaign, if set(default) kPI is vtc and does'nt have video data.
                            // we are showing data not found.
                            hasVideoAds = $scope.adFormats && kpiModel.toLowerCase() === 'vtc' &&
                                !$scope.adFormats.videoAds;

                            if (formatResponseData && formatResponseData.length > 0 && !hasVideoAds) {
                                formatDataPerfMtrcs =
                                    _.filter(formatResponseData, function (obj) {
                                        return obj.dimension.toLowerCase() !== 'unknown';
                                    });

                                formatData = _.map(formatDataPerfMtrcs, function (obj) {
                                    obj.vtc = obj.vtc_100;
                                    obj['action rate'] = obj.action_rate;

                                    return obj;
                                });

                                // This Sorts the Data order by CTR or CPA
                                sortedData = _.sortBy(formatData, kpiModel);

                                sortedData = _.contains(['cpa', 'cpm', 'cpc'], kpiModel) ?
                                    sortedData : sortedData.reverse();

                                sortedData = _.sortBy(sortedData, function (obj) {
                                    return obj[kpiModel] === 0;
                                });

                                sortedData = sortedData.slice(0, 3);

                                $scope.chartDataFormat = _.map(sortedData, function (data) {
                                    var kpiData = data[kpiModel],

                                    // It removes empty space and makes a single word and then convert to lower case
                                    screenType = data.dimension.replace(/ /g,'').toLowerCase();

                                    return {
                                        gross_env: data.gross_rev,
                                        className: formatTypeMap[screenType],
                                        icon_url: '',
                                        type: data.dimension.toLowerCase(),
                                        value: kpiData,
                                        kpiType: kpiModel
                                    };
                                });
                            }
                        }

                        $scope.formatBarChartConfig = {
                            data: $scope.chartDataFormat,
                            graphName: 'formats'
                        };
                    },function () {
                        console.log('formats data call failed');
                    });
            };

            $scope.getCostViewabilityData  = function () {
                var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_QUALITY),
                    viewData;

                 // get cost break down data
                 $scope.getCostViewabilityFlag = 0;

                dataService
                    .fetch(urlService.APIVistoCustomQuery(params))
                    .then(function (result) {
                        var highChartSeriesObj = [];

                         $scope.getCostViewabilityFlag = 1;
                         $scope.loadingViewabilityFlag = false;

                        if (result.status === 'success' && !angular.isString(result.data.data)) {
                            viewData = result.data.data;

                            $scope.details.getCostViewability = {
                                pct_display: viewData.view_metrics.viewable_imps_perc,
                                pct_video: viewData.view_metrics.video_viewability_metrics.video_viewable_perc,

                                pct_total: viewData.view_metrics.viewable_imps_perc >
                                    viewData.view_metrics.video_viewability_metrics.video_viewable_perc ?
                                    viewData.view_metrics.viewable_imps_perc :
                                    viewData.view_metrics.video_viewability_metrics.video_viewable_perc
                            };

                            if ($scope.details.getCostViewability.pct_video > 0 &&
                                $scope.details.getCostViewability.pct_display > 0) {
                                highChartSeriesObj.push({
                                    innerRadius: '85%',

                                    data: [{
                                        y: $scope.details.getCostViewability.pct_video,
                                        color:'#45CB41'
                                    }],

                                    radius: '70%'
                                });

                                highChartSeriesObj.push({
                                    innerRadius: '100%',
                                    radius: '85%',

                                    data: [{
                                        y: $scope.details.getCostViewability.pct_display,
                                        color: '#008ED5'
                                    }]
                                });
                            }

                            if ($scope.details.getCostViewability.pct_video === 0 &&
                                $scope.details.getCostViewability.pct_display > 0) {
                                highChartSeriesObj.push({
                                    innerRadius: '100%',

                                    radius: '85%',data: [{
                                        y: $scope.details.getCostViewability.pct_display,
                                        color: '#008ED5'
                                    }]
                                });
                            }

                            if ($scope.details.getCostViewability.pct_video > 0 &&
                                $scope.details.getCostViewability.pct_display === 0) {
                                highChartSeriesObj.push({
                                    innerRadius: '100%',
                                    radius: '85%',

                                    data: [{
                                        y: $scope.details.getCostViewability.pct_video,
                                        color: '#45CB41'
                                    }]
                                });
                            }

                            highChartSeriesObj.push({
                                innerRadius: '101',

                                data: [{
                                    y: $scope.details.getCostViewability.pct_total,
                                    color: '#000000'
                                }]
                            });

                            highChartSeriesObj.push({
                                innerRadius: '103',
                                radius: '102%',

                                data: [{
                                    y: 100,
                                    color: '#FFFFFF'
                                }]
                            });

                            $scope.details.getCostViewability.highChartSeriesObj = highChartSeriesObj;

                            $timeout(function () {
                                $scope.details.solidGaugeChart =
                                    solidGaugeChart.highChart($scope.details.getCostViewability);
                            });
                        }
                    }, function () {
                        console.log('cost viewability call failed');
                    });
            };

            $scope.viewReports = function (campaign, strategy) {
                campaignSelectModel.setSelectedCampaign(campaign);
                strategySelectModel.setSelectedStrategy(strategy);
                kpiSelectModel.setSelectedKpi(campaign.kpiType);

                // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just
                // fetch strategy list and retain selected strategy.
                localStorage.setItem('isNavigationFromCampaigns', true);

                utils.goToLocation(vistoconfig.PERFORMANCE_LINK);
            };

            $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
                campaign = campaign || $scope.campaign;

                if (!campaign || campaign.id === -1) {
                    return constants.MSG_DATA_NOT_AVAILABLE;
                } else if (campaign.durationLeft() === 'Yet to start') {
                    return constants.MSG_CAMPAIGN_YET_TO_START;
                } else if (campaign.daysSinceEnded() > 1000) {
                    return constants.MSG_CAMPAIGN_VERY_OLD;
                } else if (campaign.kpiType === 'null') {
                    return constants.MSG_CAMPAIGN_KPI_NOT_SET;
                } else if (campaign.status === 'active') {
                  return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
                } else if (dataSetType === 'activities') {
                    return constants.MSG_CAMPAIGN_NOT_OPTIMIZED;
                } else if (dataSetType === 'inventory' || dataSetType === 'viewability') {
                    return constants.MSG_METRICS_NOT_TRACKED;
                } else {
                    return constants.MSG_DATA_NOT_AVAILABLE;
                }
            };

            $scope.setOptimizationData = function ( campaign, action) {
                campaignSelectModel.setSelectedCampaign(campaign);
                kpiSelectModel.setSelectedKpi(campaign.kpiType);
                strategySelectModel.setSelectedStrategy(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);

                // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that we just
                // fetch strategy list and retain selected strategy.
                localStorage.setItem('isNavigationFromCampaigns', true);
                localStorage.setItem('selectedAction', JSON.stringify(action) );

                utils.goToLocation(vistoconfig.OPTIMIZATION_LINK);
            };

            $scope.setReportMenu = function () {
                $rootScope.$broadcast('callSetDefaultReport', 'Optimization Impact');
            };

            $scope.setActivityButtonData = function ( campaign, strategy) {
                campaignSelectModel.setSelectedCampaign(campaign);
                kpiSelectModel.setSelectedKpi(campaign.kpiType);
                strategySelectModel.setSelectedStrategy(strategy);

                // Campaign and strategy both are reset then fire EVENT_CAMPAIGN_STRATEGY_CHANGED event so that
                // we just fetch strategy list and retain selected strategy.
                localStorage.setItem('isNavigationFromCampaigns', true);

                utils.goToLocation(vistoconfig.OPTIMIZATION_LINK);
            };

            $scope.setGraphData = function (campaign, type) {
                if (campaign) {
                    campaign.type = type;
                    campaignSelectModel.setSelectedCampaign(campaign);
                    strategySelectModel.setSelectedStrategy(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
                    kpiSelectModel.setSelectedKpi(campaign.kpiType);
                }

                $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);

                if (type === 'cost') {
                    utils.goToLocation(vistoconfig.COST_LINK);
                } else if (type === 'quality' || type === 'videoViewability') {
                    utils.goToLocation(vistoconfig.QUALITY_LINK);
                } else if (type === 'inventory') {
                    utils.goToLocation(vistoconfig.INVENTORY_LINK);
                } else if (type === 'platform') {
                    utils.goToLocation(vistoconfig.PLATFORM_LINK);
                } else if (type === 'view_report' || type === 'formats' || type === 'screens' || type === 'adsizes') {
                    utils.goToLocation(vistoconfig.PERFORMANCE_LINK);
                } else {
                    utils.goToLocation(vistoconfig.OPTIMIZATION_LINK);
                }
            };

            $scope.watchActionFilter = function (filter, showExternal) {
                $scope.activityLogFilterByStatus = showExternal;
                $scope.details.actionChart =
                    actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue),
                        $scope.campaign.kpiType, activityList.data.data, 450, 330, null, undefined, showExternal);

                // TODO: reset D3 action performance chart here
                // D3 chart object for action performance chart
                $scope.details.lineChart = {
                    data: $scope.details.lineData,
                    kpiValue: parseFloat($scope.campaign.kpiValue),
                    kpiType: $scope.campaign.kpiType,
                    from: 'action_performance',

                    deliveryData: {
                        startDate: $scope.campaign.startDate,
                        endDate: $scope.campaign.endDate,

                        totalDays:  momentService.dateDiffInDays($scope.campaign.startDate,
                            $scope.campaign.endDate) + 1,

                        deliveryDays: $scope.details.maxDays.length,
                        bookedImpressions: $scope.details.maxDays[$scope.details.maxDays.length-1].booked_impressions
                    },

                    // customisation
                    activityList: activityList.data.data,
                    showExternal: showExternal
                };

                return filter;
            };

            // Single Campaign UI Support elements - starts
            $scope.getSpendDifference = function (campaign) {
                var spendDifference,
                    campaignCDBObj,
                    spend,
                    expectedSpend;

                if (typeof campaign !== 'undefined') {
                    // fix for initial loading
                    spendDifference = -999;

                    campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                    if (campaignCDBObj === undefined) {
                        return spendDifference;
                    }

                    spend = campaignCDBObj.getGrossRev();
                    expectedSpend = campaign.expectedMediaCost;

                    return $scope.getPercentDiff(expectedSpend, spend);
                }
            };

            $scope.getSpendTotalDifference = function (campaign) {
                var spendDifference,
                    campaignCDBObj,
                    spend,
                    totalSpend;

                if (typeof campaign !== 'undefined') {
                    spendDifference = 0;
                    campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                    if (campaignCDBObj === undefined) {
                        return spendDifference;
                    }

                    spend = campaignCDBObj.getGrossRev();
                    totalSpend = campaign.totalMediaCost;

                    return $scope.getPercentDiff(totalSpend, spend);
                }
            };

            $scope.getSpendTickDifference = function (campaign) {
                var spendDifference,
                    campaignCDBObj,
                    spend,
                    expectedSpend;

                if (typeof campaign !== 'undefined') {
                    spendDifference = 0;
                    campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                    if (campaignCDBObj === undefined) {
                        return spendDifference;
                    }

                    spend = campaign.expectedMediaCost;
                    expectedSpend = campaign.totalMediaCost;

                    return $scope.getPercentDiff(expectedSpend, spend);
                }
            };

            $scope.getPercentDiff = function (expected, actual) {
                return (expected > 0) ? utils.roundOff((actual - expected) * 100 / expected, 2) : 0;
            };

            $scope.getSpendDiffForStrategy = function (strategy) {
                var expectedSpend = strategy.expectedMediaCost;

                if (typeof strategy === 'undefined') {
                    return 0;
                }

                return $scope.getPercentDiff(expectedSpend, strategy.grossRev);
            };

            $scope.getSpendTotalDifferenceForStrategy = function (strategy) {
                var spend,
                    totalSpend;

                if (typeof campaign !== 'undefined') {
                    spend = strategy.grossRev;
                    totalSpend = strategy.totalMediaCost;

                    return $scope.getSpendDiffForStrategy(totalSpend, spend);
                }
            };

            $scope.getSpendClass = function (campaign) {
                var spendDifference;

                if (typeof campaign !== 'undefined') {
                    spendDifference = $scope.getSpendDifference(campaign);
                    return $scope.getClassFromDiff(spendDifference, campaign.end_date);
                }
            };

            $scope.getSpendClassForStrategy = function (strategy) {
                var spendDifference = $scope.getSpendDiffForStrategy(strategy);

                return $scope.getClassFromDiff(spendDifference, strategy.endDate);
            };

            $scope.getClassFromDiff = function (spendDifference, endDate) {
                var dateDiffInDays;

                if (endDate !== undefined) {
                    dateDiffInDays = momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), endDate);
                }

                // fix for initial loading
                if (spendDifference === -999) {
                    return '';
                }

                if (endDate !== undefined) {
                    if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) === false) {
                        if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                            return 'red';
                        } else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
                            return 'blue';
                        }
                    }

                    // past a campaign end date
                    if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) === true) {
                        return (spendDifference < -5 || spendDifference > 5) ? 'red': 'blue';
                    }
                }

                if (spendDifference < -10 || spendDifference > 20) {
                    return 'red';
                } else if (spendDifference >= -10 && spendDifference <= 20) {
                    return 'blue';
                }

                return 'red';
            };

            $scope.getSpendWidth = function (campaign) {
                var actualWidth;

                if (typeof campaign !== 'undefined') {
                    actualWidth = 100 + $scope.getSpendTotalDifference(campaign);

                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }

                    return actualWidth;
                }
            };

            $scope.getSpendTickWidth = function (campaign) {
                var actualWidth;

                if (typeof campaign !== 'undefined') {
                    actualWidth = 100 + $scope.getSpendTickDifference(campaign);

                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }

                    return actualWidth;
                }
            };

            $scope.getSpendWidthForStrategy = function (strategy) {
                var actualWidth = 100 + $scope.getSpendTotalDifferenceForStrategy(strategy);

                if (actualWidth > 100) {
                    actualWidth = 100;
                }

                return actualWidth;
            };

            $scope.refreshGraph = function (showExternal) {
                // Single Campaign UI Support elements - sta
                // Refresh Graph Data
                // TODO: move to D3
                $scope.details.actionChart =
                    actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue),
                        $scope.campaign.kpiType, activityList.data.data, 450, 330, null, undefined, showExternal);

                $scope.details.lineChart = {
                    data: $scope.details.lineData,
                    kpiValue: parseFloat($scope.campaign.kpiValue),
                    kpiType: $scope.campaign.kpiType,
                    from: 'action_performance',

                    deliveryData: {
                        startDate: $scope.campaign.startDate,
                        endDate: $scope.campaign.endDate,

                        totalDays:  momentService.dateDiffInDays($scope.campaign.startDate,
                            $scope.campaign.endDate) + 1,

                        deliveryDays: $scope.details.maxDays.length,
                        bookedImpressions: $scope.details.maxDays[$scope.details.maxDays.length-1].booked_impressions
                    },

                    // customisation
                    activityList: activityList.data.data,
                    showExternal: showExternal
                };
            };

            $scope.$on('$destroy', function () {
                eventActionCreatedFunc();
                callRefreshGraphData();
            });

            $scope.refreshCampaignDetailsPage = function () {
                $rootScope.$broadcast('closeEditActivityScreen');
            };

            $scope.refreshCampaignDetailsPage();

            $(document).ready(function () {
                var ItemsShown = 4,
                    nextIndex,
                    prevIndex,
                    carouselItem = $('.carousel .item'),
                    carouselLeft = $('.carousel a.left'),
                    carouselRight = $('.carousel a.right'),
                    mainNavigation = $('.main_navigation'),
                    dropdownList = $('.dropdown_ul'),
                    actionComment = $('#action_comment'),
                    editActionComment = $('#edit_action_comment'),

                    updateSaveBtnStatus = function () {
                        $('#edit_action_comment').val().replace(/\n/g, '').replace('\\n', '');
                        $('#hidden_comments').val().replace(/\n/g, '').replace('\\n', '');
                        $('#hidden_checkbox_status').val().toString();
                        $('#action_save_btn').removeAttr('disabled');
                    },

                    CommentValidation = function (boxId,errMsgId) {
                        var txtBoxId = '#' + boxId,
                            errorMsgId = '#' + errMsgId,
                            txt = ($(txtBoxId).val()),
                            maxLength = $(txtBoxId).attr('maxChar'),
                            maxLine = $(txtBoxId).attr('maxLine'),
                            txtData = '',
                            line = txt,
                            split = line.split('\n'),
                            splitLength = split.length,
                            limited_txt,
                            i;

                        if (splitLength > maxLine) {
                            for (i = 0; i < maxLine; i++) {
                                if (i === (parseInt(maxLine)) - 1) {
                                    txtData += split[i];
                                } else {
                                    txtData += split[i] + '\n';
                                }
                            }

                            $(errorMsgId).show();
                            $(errorMsgId).html('You cannot enter more than ' + maxLine + ' lines');
                            $(txtBoxId).val(txtData);

                            // check Limited characters
                            if (txt.length > maxLength ) {
                                $(errorMsgId).show();
                                $(errorMsgId).html('You cannot enter more than ' + maxLength + ' characters');
                                limited_txt = txtData.substring(0, maxLength );
                                $(txtBoxId).val(limited_txt);
                            }
                        } else {
                            if (txt.length > maxLength ) {
                                $(errorMsgId).show();
                                $(errorMsgId).html('You cannot enter more than ' + maxLength + ' characters ');
                                limited_txt = txt.substring(0, maxLength );
                                $(txtBoxId).val(limited_txt);
                            } else {
                                $(errorMsgId).hide();
                            }
                        }
                    };

                carouselLeft.hide();

                carouselRight.click(function () {
                    if (carouselItem.length === 8) {
                        nextIndex = ItemsShown;
                    } else {
                        nextIndex = $('.carousel .item').length - ItemsShown;
                    }

                    carouselItem.slice(0,nextIndex).removeClass('active');
                    carouselItem.slice(nextIndex).addClass('active');
                    carouselRight.hide();
                    carouselLeft.show();
                });

                carouselLeft.click(function () {
                    if (carouselItem.length === 8) {
                        prevIndex = ItemsShown;
                    } else {
                        prevIndex = $('.carousel .item').length - nextIndex;
                    }

                    carouselItem.slice('-'+prevIndex).removeClass('active');
                    carouselItem.slice(0,prevIndex).addClass('active');
                    carouselRight.show();
                    carouselLeft.hide();
                });

                // hot fix for the enabling the active link in the reports dropdown
                setTimeout(function () {
                    mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
                    mainNavigation.find('#reports_overview_tab').addClass('active_tab');
                }, 200);
                // end of hot fix for the enabling the active link in the reports dropdown

                window.scrollTo(0, 0);
                $('#error_more_comment,#error_edit_action_more_comment').hide();

                $( '.dropdown_ul_text' ).click(function () {
                    $( '.dropdown_ul' ).toggle();
                });

                $('.dropdown_ul li').click( function () {
                    $(this).closest('.dropdown').find('.dd_txt').text($(this).text());
                });

                $( document ).click(function () {
                    if (dropdownList.is(':visible')) {
                        dropdownList.hide();
                    }
                });

                setTimeout(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                },5000);

                $('#action_submit_btn,#action_comment').bind('click focus', function () {
                    var txt = $.trim(actionComment.val());

                    actionComment.val(txt);
                });

                $('#action_comment,#action_submit_btn').bind('change keyup keydown click', function () {
                    CommentValidation('action_comment','error_more_comment');
                });

                actionComment.bind('blur', function () {
                    $('#error_more_comment').hide();
                });

                // Edit actions
                $('#action_save_btn,#edit_action_comment').bind('click focus', function () {
                    var txt = $.trim(editActionComment.val());

                    editActionComment.val(txt);
                });

                editActionComment.bind('change keyup keydown click', function () {
                    CommentValidation('edit_action_comment', 'error_edit_action_more_comment');

                    // enable save Button
                    updateSaveBtnStatus();
                });

                editActionComment.bind('blur', function () {
                    $('#error_edit_action_more_comment').hide();
                });

                // Anywhere click close the error message tooltip while create activity
                $('body').click(function (evt) {
                    if (evt.target.id === 'crActivityForm') {
                        return;
                    }

                    if ($(evt.target).closest('#crActivityForm').length) {
                        return;
                    }

                    $('#error_activity, #error_subtype, #error_tactic, #error_metric, ' +
                        '#error_comment, #edit_error_comment').hide();
                });

                $('#action_submit_btn').click(function () {
                    $('#error_activity, #error_subtype, #error_tactic, #error_metric, #error_comment').show();
                });

                $('#action_save_btn').click(function () {
                    $('#edit_error_comment').show();
                });

                $('.activity_log_list').bind('scroll', function (e) {
                    var elem = $(e.currentTarget);

                    if (elem[0].scrollHeight - elem.scrollTop() + 1 === elem.outerHeight()) {
                        $('.gradient_div').hide();
                    } else {
                        $('.gradient_div').show();
                    }
                });
            });

            // Hot fix to show the campaign tab selected
            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#reports_nav_link')
                .addClass('active');

            angularAMD.inject(function ($rootScope, $route, vistoconfig) {
                $rootScope.$on('$locationChangeSuccess',function (evt, absNewUrl, absOldUrl) {
                    var prevUrl = absOldUrl.substring(absOldUrl.lastIndexOf('/'));

                    if ((prevUrl === vistoconfig.MEDIA_PLANS_LINK) && (absNewUrl !== vistoconfig.MEDIA_PLANS_LINK)) {
                        $rootScope.isFromCampaignList = true;
                    } else {
                        $rootScope.isFromCampaignList = false;
                    }
                });
            });
        });
    }
);
