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

            var createTacticObject = function(tacticData, timePeriod, campaign, strategyId, kpiType, kpiValue) {
                var tacticObj = [],
                    status = '',
                    adSize = '',
                    geoValues = '',
                    zipValues = '',
                    filterStartDate = '',
                    filterEndDate = '';

                for(var index in tacticData) {
                    var tactic = tacticData[index];

                    if(tactic.status === undefined /*|| tactic.status.toLowerCase() == "ready"*/){
                        status = "Draft";
                    }else{
                        status = tactic.status;
                    }
                    var media_type = tactic.media_type.toLowerCase();
                    var media_type_icon ='icon-desktop';
                    if(media_type.length > 0 ){
                        switch(media_type){
                            case 'display': media_type_icon = "icon-desktop";
                                break;
                            case 'video':   media_type_icon = "icon-video";
                                break;
                            case 'mobile':   media_type_icon = "icon-mobile";
                                break;
                            case 'facebook':   media_type_icon = "icon-social";
                                break;
                            case 'mobilevideo':   media_type_icon = "icon-video";
                                break;
                            case 'passback':   media_type_icon = "passback_graph";
                                break;
                            default: media_type_icon = "icon-desktop";
                        }
                    }
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

                    getTacticsCdbLineChart(index, tacticObj, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate, function(tacticMetrics, idx) {
                        getTacticsMetrics(idx, tacticObj, tacticMetrics);
                    });
                }
                return tacticObj;
            };

            var getTacticList = function(strategy, timePeriod, campaign,callBackFunction) {
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
                                strategy.strategyTactics = createTacticObject(data, timePeriod,campaign, strategy.id, campaign.kpiType, campaign.kpiValue);
                            } else {
                                strategy.strategyTactics = createTacticObject(data.slice(0,pageSize), timePeriod, campaign, strategy.id, campaign.kpiType, campaign.kpiValue);
                                strategy.strategyTacticsLoadMore = data.slice(pageSize);//createTacticObject(data.slice(pageSize), timePeriod, campaign, strategy.id, campaign.kpiType, campaign.kpiValue);
                            }
                        }
                    }
                    callBackFunction && callBackFunction(strategy.id,loadingFlag);
                });
            };


            var getTacticData = function(strategy, timePeriod, campaign, data) {
                //create tactic object and request cdb and metric data
                var dataObj = createTacticObject(data, timePeriod, campaign, strategy.id, campaign.kpiType, campaign.kpiValue);
                return dataObj;
            };

            var getTacticsMetrics = function(index, tacticObj, tacticMetrics) {
                if(!angular.isString(tacticMetrics)) {
                    tacticObj[index].adFormats = domainReports.checkForCampaignFormat(tacticMetrics.adFormat); //tacticMetrics.hasVTCMetric;
                    tacticObj[index].totalImpressions = tacticMetrics.impressions;
                    tacticObj[index].grossRev = tacticMetrics.gross_rev;
                    tacticObj[index].ctr = tacticMetrics.ctr * 100;
                    tacticObj[index].actionRate = tacticMetrics.action_rate;
                    tacticObj[index].vtcData = vtcMetricsJsonModifier(tacticMetrics.video_metrics);
                    tacticObj[index].vtc_rate = (tacticMetrics.video_metrics && tacticMetrics.video_metrics ) ? tacticMetrics.video_metrics.vtc_rate : -1;
                    tacticObj[index].map = {};
                    tacticObj[index].map['cpa'] = tacticMetrics.gross_ecpa;
                    tacticObj[index].map['cpc'] = tacticMetrics.gross_ecpc;
                    tacticObj[index].map['cpm'] = tacticMetrics.gross_ecpm;
                    tacticObj[index].map['vtc'] = tacticMetrics.video_metrics.vtc_rate;
                    tacticObj[index].map['clicks'] = tacticMetrics.clicks;
                    tacticObj[index].map['action_rate'] = tacticMetrics.action_rate;
                    tacticObj[index].map['ctr'] = tacticMetrics.ctr * 100;
                }
            };

            var getTacticsCdbLineChart = function(obj, tacticsList, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate, callback) {
                var sKpiType = kpiType,
                    kpiMap = {
                        'cpc': 'gross_ecpc',
                        'cpa': 'gross_ecpa',
                        'cpm': 'gross_ecpm'
                    };

                dataService.getCdbTacticsChartData(campaign.orderId, strategyId, tacticsList[obj].id, timePeriod, filterStartDate, filterEndDate).then(function (result) {
                    var lineData=[];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(sKpiType != undefined || sKpiType != null) {
                            if(result.data.data.length > 0) {
                                var maxDays = result.data.data;
                                callback && callback(_.last(maxDays), obj);
                                for (var i = 0; i < maxDays.length; i++) {
                                    maxDays[i]['ctr'] *= 100
                                    maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate;
                                    var kpiType = kpiMap[angular.lowercase(sKpiType)] ? kpiMap[angular.lowercase(sKpiType)] : angular.lowercase(sKpiType);
                                    var kpiTypeLower = angular.lowercase(kpiType);

                                    //if kpiType is delivery, plot impressions on the graph
                                    //picking up impressions from perf bydays data call
                                    if(kpiTypeLower === "delivery") {
                                        kpiTypeLower = "impressions";
                                    }

                                    lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                }
                                tacticsList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), kpiType,'tactics');

                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(angular.lowercase(kpiType) === "delivery") {
                                  //tacticsList[obj].targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions']/momentInNetworkTZ.dateDiffInDays(tacticsList[obj].startDate, tacticsList[obj].endDate) * (maxDays.length-1);
                                  tacticsList[obj].targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions'];
                                }
                                tacticsList[obj].lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat(kpiValue),
                                    kpiType: kpiType,
                                    from: 'tactics',
                                    //for delivery kpi
                                    deliveryData: {
                                      "startDate" : tacticsList[obj].startDate,
                                      "endDate" : tacticsList[obj].endDate,
                                       "totalDays" :  momentInNetworkTZ.dateDiffInDays(tacticsList[obj].startDate, tacticsList[obj].endDate) +1,
//                                      "deliveryDays": noOfdaysCampaignRun(tacticsList[obj].startDate, tacticsList[obj].endDate),
                                        "deliveryDays": maxDays.length,
                                        "bookedImpressions":  maxDays[maxDays.length-1]['booked_impressions'] //REVIEW: tacticsList[obj].totalImpressions
                                    }
                                };
                            } else {
                                tacticsList[obj].chart = false;
                            }
                        }
                    } else {
                        tacticsList[obj].chart = false;
                    }
                }, function() {
                    tacticsList[obj].chart = false;
                });
            };

            var createStrategyObject = function(strategyData, timePeriod, campaign, kpiType, kpiValue) {
                var strategyObj = [],
                    adSize = '',
                    keyValues = '',
                    geos = '';

                for (var index in strategyData) {
                    var strategy = strategyData[index],
                        strategy_1 = {
                            id: strategy.id,
                            brandName: campaign.brandName,
                            name: strategy.name,
                            startDate: momentInNetworkTZ.utcToLocalTime(strategy.start_date),
                            endDate: momentInNetworkTZ.utcToLocalTime(strategy.end_date),
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
                    getStrategyCdbLineChart(index, strategyObj, timePeriod, campaign, kpiType, kpiValue);
                    //getStrategyMetrics(index, strategyObj, timePeriod, campaign);

                    //moved tactic data call outside - when user requests tactic data
                    //getTacticList(index, strategyObj, timePeriod, campaign, strategyObj[index].id, kpiType, kpiValue);
                }
                return strategyObj;
            };

            var getStrategyMetrics = function(index, strategyObj, strategyData) {
                var strategyMetrics = strategyData.measures_by_days;
                strategyMetrics = _.last(strategyMetrics);
                strategyObj[index].adFormats = domainReports.checkForCampaignFormat(strategyData.adFormats); //strategyData.hasVTCMetric;
                strategyObj[index].totalImpressions = strategyMetrics.impressions;
                strategyObj[index].grossRev = strategyMetrics.gross_rev;
                strategyObj[index].ctr = strategyMetrics.ctr * 100;
                strategyObj[index].actionRate = strategyMetrics.action_rate;
                strategyObj[index].vtcData = vtcMetricsJsonModifier(strategyMetrics.video_metrics);
                strategyObj[index].vtc_rate = strategyMetrics.video_metrics.vtc_rate;
                strategyObj[index].map = {};
                strategyObj[index].map['cpa'] = strategyMetrics.cpa;
                strategyObj[index].map['cpc'] = strategyMetrics.cpc;
                strategyObj[index].map['cpm'] = strategyMetrics.cpm;
                strategyObj[index].map['vtc'] = strategyMetrics.video_metrics.vtc_rate;
                strategyObj[index].map['clicks'] = strategyMetrics.clicks;
                strategyObj[index].map['action_rate'] = strategyMetrics.action_rate;
                strategyObj[index].map['ctr'] = strategyMetrics.ctr * 100;
            };

            var getStrategyCdbLineChart = function(obj, strategyList, timePeriod, campaign, kpiType, kpiValue) {
                var sKpiType=kpiType;
                dataService.getCdbChartData(campaign, timePeriod, 'strategies', strategyList[obj].id).then(function (result) {
                    var lineData=[];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(sKpiType != undefined || sKpiType != null) {
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                getStrategyMetrics(obj, strategyList, result.data.data);
                                for (var i = 0; i < maxDays.length; i++) {
                                    var kpiType = (sKpiType);
                                    maxDays[i]['ctr'] *= 100
                                    maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate;
                                    var kpiTypeLower = angular.lowercase(kpiType);

                                    //if kpiType is delivery, plot impressions on the graph
                                    //picking up impressions from perf bydays data call
                                    if(kpiTypeLower === "delivery") {
                                        kpiTypeLower = "impressions";
                                    }

                                    lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                }
                                strategyList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType,'strategy');
                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(angular.lowercase(kpiType) === "delivery") {
                                    //strategyList[obj].targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions']/momentInNetworkTZ.dateDiffInDays(strategyList[obj].startDate, strategyList[obj].endDate) * (maxDays.length-1);
                                    strategyList[obj].targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions'];
                                }
                                strategyList[obj].lineChart = {
                                    data: lineData,
                                    kpiValue: parseFloat(kpiValue),
                                    kpiType: sKpiType,
                                    from: 'strategy',
                                    //for delivery kpi
                                    deliveryData: {
                                      "startDate" : strategyList[obj].startDate,
                                      "endDate" : strategyList[obj].endDate,
                                      "totalDays" :  momentInNetworkTZ.dateDiffInDays(strategyList[obj].startDate, strategyList[obj].endDate) +1,
//                                      "deliveryDays": noOfdaysCampaignRun(strategyList[obj].startDate, strategyList[obj].endDate),
                                        "deliveryDays": maxDays.length,
                                      "bookedImpressions": maxDays[maxDays.length-1]['booked_impressions'] //REVIEW:  strategyList[obj].totalImpressions
                                    }
                                };
                            } else {
                                strategyList[obj].chart = false;
                            }
                        }
                    } else {
                        strategyList[obj].chart = false;
                    }
                }, function() {
                    strategyList[obj].chart = false;
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
                            var dataObj, campaignStrategies ;

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


                            dataObj = createStrategyObject(data.slice(0, pageSize), timePeriod, campaign, kpiType, kpiValue);
                            campaignStrategies = dataObj;//_.chain(dataObj);

                            if(data.length <= pageSize) {
                                campaign.campaignStrategies = campaignStrategies;
                            } else {
                                campaign.campaignStrategies = campaignStrategies;
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
                    var lineDate = [], cdData;
                    campaignObject.chart = true;
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(!angular.isUndefined(campaignObject.kpiType)) {
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                for (var i = 0; i < maxDays.length; i++) {
                                    maxDays[i]["ctr"] *= 100;
                                    maxDays[i]['vtc'] = maxDays[i].video_metrics.vtc_rate;

                                    var kpiType = (campaignObject.kpiType),
                                        kpiTypeLower = angular.lowercase(kpiType);

                                        //if kpiType is delivery, plot impressions on the graph
                                        //picking up impressions from perf bydays data call
                                        if(kpiTypeLower === "delivery") {
                                            kpiTypeLower = "impressions";
                                        }

                                    lineDate.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2),
                                        'date': maxDays[i]['date'] });
                                }
                                cdData = _.last(maxDays);
                                cdData['adFormats'] = domainReports.checkForCampaignFormat(result.data.data.adFormats);
                                //result.data.data.hasVTCMetric;
                                callback && callback(cdData);
                                campaignObject.chart = new line.highChart(lineDate, parseFloat(campaignObject.kpiValue),
                                    campaignObject.kpiType,'campaign');
                                //d3 chart data
                                //REVIEW: TARGET -DELIVERY
                                if(angular.lowercase(kpiType) === "delivery") {
                                    //campaignObject.targetKPIImpressions =
                                    // maxDays[maxDays.length-1]['booked_impressions'] /
                                    // momentInNetworkTZ.dateDiffInDays(campaignObject.startDate, campaignObject.endDate) *
                                    // (maxDays.length-1);
                                    campaignObject.targetKPIImpressions= maxDays[maxDays.length-1]['booked_impressions'];
                                }

                                campaignObject.lineChart = {
                                    data: lineDate,
                                    kpiValue: parseFloat(campaignObject.kpiValue),
                                    kpiType: campaignObject.kpiType,
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
                setActiveInactiveCampaigns: function (dataArr, timePeriod, periodStartDate, periodEndDate, callback) {
                    var status = '', campaignList = [];

                    for (var obj in dataArr) {
                        if (!angular.isObject(dataArr[obj])) {
                            continue;
                        }
                        status = (dataArr[obj].status).toLowerCase();
                        switch(status){
                            case 'ready' :
                            case 'draft' :
                                status = 'draft';
                                break;
                            case 'active' :
                            case 'delivering' :
                                status = 'delivering';
                                break;
                            case 'completed' :
                                status = 'completed';
                                break;
                            default :
                                status = undefined;
                        }

                        dataArr[obj].start_date =
                            momentInNetworkTZ.utcToLocalTime(dataArr[obj].start_date, constants.DATE_UTC_SHORT_FORMAT);
                        dataArr[obj].end_date =
                            momentInNetworkTZ.utcToLocalTime(dataArr[obj].end_date, constants.DATE_UTC_SHORT_FORMAT);

                        var campaign = modelTransformer.transform(dataArr[obj], campaignModel);
                        campaign.periodStartDate = periodStartDate;
                        campaign.periodEndDate = periodEndDate;
                        campaign.fromSuffix = utils.formatDate(this.start_date);
                        campaign.toSuffix = utils.formatDate(this.end_date);
                        campaign.setVariables();
                        campaign.setMomentInNetworkTz(momentInNetworkTZ);
                        //TODO: set default to DELIVERY if null or undefined
                        if (campaign.kpi_type == 'null' || campaign.kpi_type == '') {
                            campaign.kpi_type = 'DELIVERY';
                            campaign.kpiType = 'DELIVERY';
                            campaign.kpi_value = 0;
                            campaign.kpiValue = 0;
                        }
                        campaignList.push(campaign);
                    }
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
