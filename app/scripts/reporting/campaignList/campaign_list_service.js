define(['angularAMD', 'common/services/data_service', 'common/utils', 'common/services/transformer_service',
                      'reporting/models/campaign_model', 'common/services/request_cancel_service', 'common/services/constants_service',
                      'common/moment_utils', 'reporting/models/domain_reports', 'login/login_model',
                      'reporting/timePeriod/time_period_model', 'common/services/url_service', 'reporting/common/charts/line'
         ],function (angularAMD) {
    "use strict";
    //originally in models/campaign.js
    angularAMD.factory("campaignListService", ['dataService', 'utils', 'modelTransformer',
                                               'campaignModel', 'requestCanceller', 'constants',
                                               'momentService','domainReports', 'loginModel',
                                               'timePeriodModel', 'urlService', "line",
        function (dataService,  utils,  modelTransformer,
                  campaignModel, requestCanceller,
                  constants , momentInNetworkTZ, domainReports, loginModel,
                  timePeriodModel, urlService, line) {

            var listCampaign = "";

            var setListCampaign = function(campaign) {
                listCampaign = campaign;
            }

            var getListCampaign = function() {
                return listCampaign;
            }

            var noOfdaysCampaignRun = function(startDate, endDate) {
                var today = momentInNetworkTZ.today();
                var startDate = momentInNetworkTZ.newMoment(startDate);
                var endDate = momentInNetworkTZ.newMoment(endDate);

		/*
                var totalDays = endDate.diff(startDate, 'days') + 1,
                    daysOver = Math.round(today.diff(startDate, 'days', true));
                return Math.round((daysOver / totalDays) * 100);
		*/
                if (endDate > today) {
                    endDate = today;
                }
                return endDate.diff(startDate, 'days') + 1;
            };

            var createTacticObject = function(tacticData, timePeriod, campaign, strategyId) {
                var tacticObj = [],
                    status = '',
                    adSize = '',
                    geoValues = '',
                    zipValues = '',
                    mediaTypeIconMap = {'display': "icon-desktop", 'video': "icon-video", 'mobile': "icon-mobile",
                            'facebook': "icon-social", 'mobilevideo': "icon-video", 'passback': "passback_graph"},
                    filterStartDate = '',
                    filterEndDate = '';

                _.each(tacticData, function(tactic) {

                    status = (tactic.status === undefined ? "Draft" : tactic.status);
                    var media_type_icon = mediaTypeIconMap[tactic.media_type.toLowerCase()];
                    media_type_icon || (media_type_icon = 'icon-desktop');

                    var tactic_1 = {
                        id: tactic.id,
                        media_type_icon: media_type_icon,
                        name: tactic.name,
                        startDate: momentInNetworkTZ.newMoment(tactic.start_date).format('YYYY-MM-DD'),
                        endDate: momentInNetworkTZ.newMoment(tactic.end_date).format('YYYY-MM-DD'),
                        ad_size: _.uniq(tactic.ad_size),
                        platform_name: tactic.platform_name,
                        platform_icon: tactic.platform_icon_url,
                        status: status,
                        audience_targeting: adSize || null,
                        zip_targeting: zipValues,
                        geo_targeting: geoValues,
                        totalImpressions: tactic.impressions,
                        grossRev: null,
                        totalMediaCost: tactic.total_media_cost,
                        expectedMediaCost: tactic.expected_media_cost,
                        kpiType: tactic.kpi_type.toLowerCase(),
                        kpiValue: tactic.kpi_value,
                        ctr: 0,
                        vtc: 0,
                        actionRate: 0,
                        chart: false,
                        momentInNetworkTZ: momentInNetworkTZ,
                        is_tracking: tactic.is_tracking
                    };
                    tactic_1.durationCompletion = campaign.durationCompletion.bind(tactic_1);
                    tactic_1.durationLeft = campaign.durationLeft.bind(tactic_1);
                    tactic_1.daysSinceEnded = campaign.daysSinceEnded.bind(tactic_1);

                    tacticObj.push(tactic_1);
                    //based on time period use period dates or flight dates
                    switch(timePeriod) {
                        case 'last_7_days':
                        case 'last_30_days':
                            //campaign period dates for timefiltering
                            filterStartDate = '';
                            filterEndDate = '';
                            break;
                        case 'life_time':
                        default:
                            //campaign flight dates for timefilter
                            filterStartDate = campaign.startDate;
                            filterEndDate = campaign.endDate;
                    }

                    getTacticsCdbLineChart(tactic_1, timePeriod, campaign, strategyId, filterStartDate, filterEndDate);
                });
                return tacticObj;
            };

            var getTacticList = function(strategy, timePeriod, campaign, callBackFunction) {
                var loadingFlag = 1, tacticDataService;
                if (strategy.id === 0) {
                    tacticDataService = dataService.getUnassignedTacticList(campaign.id)
                } else {
                    tacticDataService = dataService.getStrategyTacticList(strategy.id)
                }
                tacticDataService.then(function (response) {
                    var result = response.data,
                        pageSize = 3,
                        data = result.data,
                        loadingFlag = 0;
                    if(result.status == "OK" && !angular.isString(data)) {
                        if(data.length >= 0) {
                            if(data.length <= pageSize) {
                                strategy.strategyTactics = createTacticObject(data, timePeriod, campaign, strategy.id);
                            } else {
                                strategy.strategyTactics = createTacticObject(data.slice(0, pageSize), timePeriod, campaign, strategy.id);
                                strategy.strategyTacticsLoadMore = data.slice(pageSize);
                            }
                        }
                    }
                    callBackFunction && callBackFunction(strategy.id,loadingFlag);
                });
            };


            var getTacticData = function(strategy, timePeriod, campaign, data) {
                //create tactic object and request cdb and metric data
                var dataObj = createTacticObject(data, timePeriod, campaign, strategy.id);
                return dataObj;
            };

            var getTacticsMetrics = function(tactic, tacticMetrics) {
                if(!angular.isString(tacticMetrics)) {
                    tactic.adFormats = domainReports.checkForCampaignFormat(tacticMetrics.adFormat); //tacticMetrics.hasVTCMetric;
                    tactic.totalImpressions = tacticMetrics.impressions;
                    tactic.grossRev = tacticMetrics.gross_rev;
                    tactic.ctr = tacticMetrics.ctr * 100;
                    tactic.actionRate = tacticMetrics.action_rate;
                    tactic.vtcData = vtcMetricsJsonModifier(tacticMetrics.video_metrics);
                    tactic.vtc_rate = (tacticMetrics.video_metrics && tacticMetrics.video_metrics ) ? tacticMetrics.video_metrics.vtc_rate : -1;
                    tactic.map = {};
                    tactic.map['cpa'] = tacticMetrics.gross_ecpa;
                    tactic.map['cpc'] = tacticMetrics.gross_ecpc;
                    tactic.map['cpm'] = tacticMetrics.gross_ecpm;
                    tactic.map['vtc'] = tacticMetrics.video_metrics.vtc_rate;
                    tactic.map['clicks'] = tacticMetrics.clicks;
                    tactic.map['action_rate'] = tacticMetrics.action_rate;
                    tactic.map['ctr'] = tacticMetrics.ctr * 100;
                }
            };

            var getTacticsCdbLineChart = function(tactic, timePeriod, campaign, strategyId, filterStartDate, filterEndDate) {
                var kpiType = tactic.kpiType,
                    kpiValue = tactic.kpiValue,
                    kpiMap = {
                        'cpc': 'gross_ecpc',
                        'cpa': 'gross_ecpa',
                        'cpm': 'gross_ecpm'
                    };

                dataService.getCdbTacticsChartData(campaign.orderId, strategyId, tactic.id, timePeriod, filterStartDate, filterEndDate).then(function (result) {
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(kpiType != undefined || kpiType != null) {
                            var kpiTypeLower = angular.lowercase(kpiType);
                            if(result.data.data.length > 0) {
                                var maxDays = result.data.data;
                                getTacticsMetrics(tactic, _.last(maxDays));
                                var i = 0,
                                lineData = _.map(maxDays, function(item) {
                                    item['ctr'] *= 100;
                                    item['vtc'] = item.video_metrics.vtc_rate;
                                    var tempKpiType = kpiMap[kpiTypeLower] ? kpiMap[kpiTypeLower] : kpiTypeLower;

                                    return { 'x': i + 1, 'y': utils.roundOff(item[tempKpiType], 2), 'date': item['date'] };
                                });
                                tactic.chart = new line.highChart(lineData, parseFloat(kpiValue), kpiTypeLower, 'tactics');

                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(kpiTypeLower === "impressions") {
                                  //tactic.targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions']/momentInNetworkTZ.dateDiffInDays(tactic.startDate, tactic.endDate) * (maxDays.length-1);
                                  tactic.targetKPIImpressions = maxDays[maxDays.length-1]['booked_impressions'];
                                }
                                tactic.lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat(kpiValue),
                                    kpiType: kpiTypeLower,
                                    from: 'tactics',
                                    //for delivery kpi
                                    deliveryData: {
                                        "startDate": tactic.startDate,
                                        "endDate": tactic.endDate,
                                        "totalDays":  momentInNetworkTZ.dateDiffInDays(tactic.startDate, tactic.endDate) +1,
//                                      "deliveryDays": noOfdaysCampaignRun(tactic.startDate, tactic.endDate),
                                        "deliveryDays": maxDays.length,
                                        "bookedImpressions":  maxDays[maxDays.length-1]['booked_impressions'] //REVIEW: tactic.totalImpressions
                                    }
                                };
                            } else {
                                tactic.chart = false;
                            }
                        }
                    } else {
                        tactic.chart = false;
                    }
                }, function() {
                    tactic.chart = false;
                });
            };

            var createStrategyObject = function(strategyData, timePeriod, campaign, kpiType, kpiValue) {
                var strategyObj = [],
                    adSize = '',
                    keyValues = '',
                    geos = '';

                _.each(strategyData, function(strategy) {
                    var strategy_1 = {
                            id: strategy.id,
                            brandName: campaign.brandName,
                            name: strategy.name,
                            startDate: momentInNetworkTZ.utcToLocalTime(strategy.start_date,'YYYY-MM-DD'),
                            endDate: momentInNetworkTZ.utcToLocalTime(strategy.end_date,'YYYY-MM-DD'),
                            order_id: strategy.order_id,
                            li_status: "Draft",
                            ad_size: adSize,
                            tactics_count: strategy.ads_count || 0,
                            selected_key_values: keyValues,
                            selected_geos: geos,
                            totalImpressions: null,
                            grossRev: null,
                            totalMediaCost: utils.roundOff(strategy.total_media_cost, 2),
                            expectedMediaCost: utils.roundOff(strategy.expected_media_cost, 2),
                            ctr: 0,
                            actionRate: 0,
                            chart: false,
                            momentInNetworkTZ: momentInNetworkTZ
                        };

                    strategy_1.durationCompletion = campaign.durationCompletion.bind(strategy_1);
                    strategy_1.durationLeft = campaign.durationLeft.bind(strategy_1);
                    strategy_1.daysSinceEnded = campaign.daysSinceEnded.bind(strategy_1);

                    strategyObj.push(strategy_1);
                    getStrategyCdbLineChart(strategy_1, timePeriod, campaign, kpiType, kpiValue);
                });
                return strategyObj;
            };

            var getStrategyMetrics = function(strategy, strategyMetrics, adFormats) {
                strategy.adFormats = domainReports.checkForCampaignFormat(adFormats); //strategyData.hasVTCMetric;
                strategy.totalImpressions = strategyMetrics.impressions;
                strategy.grossRev = strategyMetrics.gross_rev;
                strategy.ctr = strategyMetrics.ctr * 100;
                strategy.actionRate = strategyMetrics.action_rate;
                strategy.vtcData = vtcMetricsJsonModifier(strategyMetrics.video_metrics);
                strategy.vtc_rate = strategyMetrics.video_metrics.vtc_rate;
                strategy.map = {};
                strategy.map['cpa'] = strategyMetrics.cpa;
                strategy.map['cpc'] = strategyMetrics.cpc;
                strategy.map['cpm'] = strategyMetrics.cpm;
                strategy.map['vtc'] = strategyMetrics.video_metrics.vtc_rate;
                strategy.map['clicks'] = strategyMetrics.clicks;
                strategy.map['action_rate'] = strategyMetrics.action_rate;
                strategy.map['ctr'] = strategyMetrics.ctr * 100;
            };

            var getStrategyCdbLineChart = function(strategy, timePeriod, campaign, kpiType, kpiValue) {
                dataService.getCdbChartData(campaign, timePeriod, 'strategies', strategy.id).then(function (result) {
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(kpiType != undefined || kpiType != null) {
                            var kpiTypeLower = angular.lowercase(kpiType);
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                getStrategyMetrics(strategy, _.last(maxDays), result.data.data.adFormats);
                                var i = 0, 
                                lineData = _.map(maxDays, function(item) {
                                    item['ctr'] *= 100
                                    item['vtc'] = item.video_metrics.vtc_rate;

                                    return { 'x': i + 1, 'y': utils.roundOff(item[kpiTypeLower], 2), 'date': item['date'] };
                                });
                                strategy.chart = new line.highChart(lineData, parseFloat(kpiValue), kpiTypeLower, 'strategy');
                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(kpiTypeLower === "impressions") {
                                    //strategy.targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions']/momentInNetworkTZ.dateDiffInDays(strategy.startDate, strategy.endDate) * (maxDays.length-1);
                                    strategy.targetKPIImpressions = maxDays[maxDays.length-1]['booked_impressions'];
                                }
                                strategy.lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat(kpiValue),
                                    kpiType: kpiTypeLower,
                                    from: 'strategy',
                                    //for delivery kpi
                                    deliveryData: {
                                      "startDate": strategy.startDate,
                                      "endDate": strategy.endDate,
                                      "totalDays":  momentInNetworkTZ.dateDiffInDays(strategy.startDate, strategy.endDate) +1,
//                                      "deliveryDays": noOfdaysCampaignRun(strategy.startDate, strategy.endDate),
                                      "deliveryDays": maxDays.length,
                                      "bookedImpressions": maxDays[maxDays.length-1]['booked_impressions'] //REVIEW:  strategy.totalImpressions
                                    }
                                };
                            } else {
                                strategy.chart = false;
                            }
                        }
                    } else {
                        strategy.chart = false;
                    }
                }, function() {
                    strategy.chart = false;
                });
            };

            var getStrategyListData = function(clientId, campaign, timePeriod) {

                var kpiType = campaign.kpiType,
                    kpiValue = campaign.kpiValue,
                    pageSize = 3;

                var url = '/clients/' + clientId + '/campaigns/' + campaign.orderId + '/ad_groups' ;
                dataService.getCampaignStrategies(url, 'list').then(function (result) {
                    var data = result.data.data;
                    if(result.status == "success" && !angular.isString(data)) {
                        if(data.length >= 0) {
                            //TODO: DO NOT DELETE - UNTIL WE INTRODUCE PAGINATION
                            // var dataObj =  createStrategyObject(result.data.data, timePeriod, campaign, kpiType, kpiValue);
                            // var campaignStrategies = _.chain(dataObj).sortBy('name').sortBy('startDate').value().reverse();
                            // if(result.data.data.length <= 3) {
                            //     campaign.campaignStrategies = campaignStrategies;
                            // } else {
                            //     campaign.campaignStrategies = campaignStrategies.slice(0,3);
                            //     campaign.campaignStrategiesLoadMore = campaignStrategies.slice(3);
                            // }

                            //TO DO: optimise this a bit futher after introducing pagination
                            //TO DO: separate list data call and data manipulation

                            if(data.length <= pageSize) {
                                campaign.campaignStrategies = createStrategyObject(data, timePeriod, campaign, kpiType, kpiValue);;
                            } else {
                                campaign.campaignStrategies = createStrategyObject(data.slice(0, pageSize), timePeriod, campaign, kpiType, kpiValue);
                                campaign.campaignStrategiesLoadMore = data.slice(pageSize);
                            }
                        }
                    }
                });
            };

            var getStrategyData = function(campaign, timePeriod, data) {
                //this requests strategy data - invoked when requestStrategiesData is called from controller
                var dataObj = createStrategyObject(data, timePeriod, campaign, campaign.kpiType, campaign.kpiValue);
               // var campaignStrategies = _.chain(dataObj).sortBy('name').sortBy('startDate').value().reverse();

                return dataObj;
            };

            var vtcMetricsJsonModifier =  function(vtcMetricJson) {
                var vtcMapper =  {'vtc_25_perc': 25, 'vtc_50_perc' : 50, 'vtc_75_perc' : 75, 'vtc_rate' : 100};
                var vtcDataToPlot = [];
                var vtcRoundOff =  function(input, places) {
                    places = input >1 ? 0 : places;
                    var factor = Math.pow(10, places);
                    return Math.round(input * factor) / factor;
                }
                _.each(vtcMetricJson, function(value, key) {
                    if(vtcMapper[key]) {
                        vtcDataToPlot.push({'vtc' : vtcMapper[key], 'values' : vtcRoundOff(value, 2) })
                    }
                });
                vtcDataToPlot.push({'vtc' : 0, 'values' :100});
                vtcDataToPlot = _.sortBy(vtcDataToPlot , 'vtc');
                var baseConfiguration = {
                    data : {
                        json : [vtcDataToPlot],
                        keys : {
                            xAxis : {
                                val : 'vtc',
                                tickValues : _.pluck(vtcDataToPlot, 'vtc')
                            },
                            yAxis : {
                                val : 'values',
                                tickValues : []
                            }
                        },
                        margin : {
                            top : 20,
                            right: 20,
                            left: 20,
                            bottom: 20,
                        },
                        showPathLabel :  true,
                        showAxisLabel : false,
                        axisLabel : ['Plays', 'Views']
                    }
                }
                return baseConfiguration;
            }

            var getCdbLineChart = function(campaignObject, timePeriod, callback) {
                dataService.getCdbChartData(campaignObject, timePeriod, 'campaigns', null).then(function (result) {
                    var cdData;
                    campaignObject.chart = true;
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(!angular.isUndefined(campaignObject.kpiType)) {
                            var kpiType = campaignObject.kpiType,
                                kpiValue = campaignObject.kpiValue,
                                kpiTypeLower = angular.lowercase(kpiType);
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days,
                                i = 0,
                                lineData = _.map(maxDays, function(item) {
                                    item["ctr"] *= 100;
                                    item['vtc'] = item.video_metrics.vtc_rate;

                                    return { 'x': i + 1, 'y': utils.roundOff(item[kpiTypeLower], 2), 'date': item['date'] };
                                });
                                cdData = _.last(maxDays);
                                cdData['adFormats'] = domainReports.checkForCampaignFormat(result.data.data.adFormats);
                                //result.data.data.hasVTCMetric;
                                callback && callback(cdData);
                                campaignObject.chart = new line.highChart(lineData, parseFloat(kpiValue), kpiTypeLower, 'campaign');
                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(kpiTypeLower === "impressions") {
                                    //campaignObject.targetKPIImpressions =
                                    // maxDays[maxDays.length-1]['booked_impressions'] /
                                    // momentInNetworkTZ.dateDiffInDays(campaignObject.startDate, campaignObject.endDate) *
                                    // (maxDays.length-1);
                                    campaignObject.targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions'];
                                }

                                campaignObject.lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat(kpiValue),
                                    kpiType: kpiTypeLower,
                                    from: 'campaign',
                                    //for delivery kpi
                                    deliveryData: {
                                      "startDate" : campaignObject.startDate,
                                      "endDate" : campaignObject.endDate,
                                      "totalDays" :  momentInNetworkTZ.dateDiffInDays(campaignObject.startDate, campaignObject.endDate) +1,
//                                      "deliveryDays": noOfdaysCampaignRun(campaignObject.startDate, campaignObject.endDate),
                                        "deliveryDays": maxDays.length,
                                        "bookedImpressions": maxDays[maxDays.length-1]['booked_impressions'] //REVIEW: campaignObject.total_impressions
                                    }
                                };
                            } else {
                                campaignObject.chart = false;
                                callback && callback(campaignObject);
                            }
                        }
                    }else{
                        campaignObject.chart = false;
                        callback && callback(campaignObject);
                    }
                }, function() {
                    campaignObject.chart = false;
                    callback && callback(campaignObject);
                });
            };

            return {
                getCampaigns: function (url, success, failure) {
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_LIST_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                },

                getDashboardData: function (url, success, failure) {
                    var canceller = requestCanceller.initCanceller(constants.DASHBOARD_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                },

                setListCampaign:setListCampaign,

                getListCampaign:getListCampaign,

                getCdbLineChart : getCdbLineChart,
                vtcMetricsJsonModifier :vtcMetricsJsonModifier,
                setActiveInactiveCampaigns: function (campaigns, timePeriod, periodStartDate, periodEndDate, callback) {
                    var campaignList = [];

                    _.each(campaigns, function(camp) {
                        if (!angular.isObject(camp)) {
                            return;
                        }

                        camp.start_date =
                            momentInNetworkTZ.utcToLocalTime(camp.start_date, constants.DATE_UTC_SHORT_FORMAT);
                        camp.end_date =
                            momentInNetworkTZ.utcToLocalTime(camp.end_date, constants.DATE_UTC_SHORT_FORMAT);

                        var campaign = modelTransformer.transform(camp, campaignModel);
                        campaign.periodStartDate = periodStartDate;
                        campaign.periodEndDate = periodEndDate;
                        campaign.fromSuffix = utils.formatDate(camp.start_date);
                        campaign.toSuffix = utils.formatDate(camp.end_date);
                        campaign.setVariables();
                        campaign.setMomentInNetworkTz(momentInNetworkTZ);
                        //TODO: set default to DELIVERY if null or undefined
                        if (campaign.kpi_type == 'null' || campaign.kpi_type == '') {
                            campaign.kpi_type = 'IMPRESSIONS';
                            campaign.kpiType = 'IMPRESSIONS';
                            campaign.kpi_value = 0;
                            campaign.kpiValue = 0;
                        }
                        campaignList.push(campaign);
                    });
                    return campaignList;
                },

                //should be moved to costservice inside cost module later
                getCampaignCostData: function(campaignIds, filterStartDate, filterEndDate, advertiserId, brandId, success, failure) {
                    var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);
                    var queryObj = {
                        queryId: 14, //14 : cost_report_for_one_or_more_campaign_ids
                        clientId: loginModel.getSelectedClient().id,
                        campaignIds: campaignIds,
                        dateFilter: datefilter,
                        advertiserId: advertiserId,
                        brandId: brandId
                    }
                    var url = urlService.APIVistoCustomQuery(queryObj);
                    var canceller = requestCanceller.initCanceller(constants.COST_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                },

                //should be moved to campaign details service
                getStrategiesData: function(clientId, campaign, timePeriod) {
                    //request list
                    return getStrategyListData(clientId, campaign, timePeriod)
                },

                requestStrategiesData: function(campaign, timePeriod, data) {
                    //request metrics and cdb data
                    return getStrategyData(campaign, timePeriod, data)
                },

                requestTacticsList: function(strategy, timePeriod, campaign,callBackFunction) {
                    //request list
                    return getTacticList(strategy, timePeriod, campaign,callBackFunction);
                },

                requestTacticsData: function(strategy, timePeriod, campaign, data) {
                    //request metrics and cdb data
                    return getTacticData(strategy, timePeriod, campaign, data);
                }
            };
        }]);
});
