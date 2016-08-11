define(['angularAMD', 'common/services/data_service', 'common/utils', 'common/services/transformer_service',
    'reporting/models/campaign_model', 'common/services/request_cancel_service', 'common/services/constants_service',
    'common/moment_utils', 'reporting/models/domain_reports', 'login/login_model',
    'reporting/timePeriod/time_period_model', 'common/services/url_service', 'reporting/common/charts/line',
    'common/services/vistoconfig_service', 'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model'],

    function (angularAMD) {
        'use strict';

        // originally in models/campaign.js
        angularAMD.factory('campaignListService', ['dataService', 'utils', 'modelTransformer', '$routeParams',
            'campaignModel','requestCanceller', 'constants', 'momentService', 'domainReports', 'loginModel',
            'timePeriodModel','urlService', 'line', 'vistoconfig',
            function (dataService, utils, modelTransformer, $routeParams, campaignModel, requestCanceller,
                                            constants, momentInNetworkTZ, domainReports, loginModel, timePeriodModel,
                                            urlService, line,  vistoconfig) {
                var listCampaign = '',
                    lineItemData = {},
                    selectedLineItemId = '',

                    setListCampaign = function (campaign) {
                        listCampaign = campaign;
                    },

                    getListCampaign = function () {
                        return listCampaign;
                    },

                    createTacticObject = function (clientId, campaign, strategyId, tacticData, timePeriod) {
                        var tacticObj = [],
                            adSize = '',
                            geoValues = '',
                            zipValues = '',

                            mediaTypeIconMap = {
                                display: 'icon-desktop',
                                video: 'icon-video',
                                mobile: 'icon-mobile',
                                facebook: 'icon-social',
                                mobilevideo: 'icon-video',
                                passback: 'passback_graph'
                            },

                            filterStartDate = '',
                            filterEndDate = '',
                            mediaTypeIcon;

                        _.each(tacticData, function (tactic) {
                            var tactic1 = {
                                id: tactic.id,
                                media_type_icon: mediaTypeIcon,
                                name: tactic.name,
                                startDate: momentInNetworkTZ.utcToLocalTime(tactic.start_date, 'YYYY-MM-DD'),
                                endDate: momentInNetworkTZ.utcToLocalTime(tactic.end_date, 'YYYY-MM-DD'),
                                ad_size: _.uniq(tactic.ad_size),
                                platform_name: tactic.platform_name,
                                platform_icon: tactic.platform_icon_url,
                                status: (tactic.status === undefined ? 'Draft' : tactic.status),
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
                                is_tracking: tactic.is_tracking,
                                spend:tactic.spend
                            };

                            mediaTypeIcon = mediaTypeIconMap[tactic.media_type.toLowerCase()];
                            mediaTypeIcon || (mediaTypeIcon = 'icon-desktop');

                            tactic1.durationCompletion = campaign.durationCompletion.bind(tactic1);
                            tactic1.durationLeft = campaign.durationLeft.bind(tactic1);
                            tactic1.daysSinceEnded = campaign.daysSinceEnded.bind(tactic1);
                            tacticObj.push(tactic1);

                            // based on time period use period dates or flight dates
                            switch (timePeriod) {
                                case 'last_7_days':
                                case 'last_30_days':
                                    // campaign period dates for timefiltering
                                    filterStartDate = '';
                                    filterEndDate = '';
                                    break;

                                case 'life_time': // jshint ignore:line
                                default:
                                    // campaign flight dates for timefilter
                                    filterStartDate = campaign.startDate;
                                    filterEndDate = campaign.endDate;
                            }

                            getTacticsCdbLineChart(clientId, campaign, strategyId,
                                timePeriod, filterStartDate, filterEndDate);
                        });

                        return tacticObj;
                    },

                    getTacticList = function (clientId, campaign, strategy, timePeriod, callBackFunction) {
                        var tacticDataService;

                        if (strategy.id === 0) {
                            tacticDataService = dataService.getUnassignedTacticList(clientId, campaign.id);
                        } else {
                            tacticDataService = dataService.getStrategyTacticList(clientId, campaign.id, strategy.id);
                        }
                        tacticDataService.then(function (response) {
                            var result = response.data,
                                pageSize = 3,
                                data = result.data,
                                loadingFlag = 0;

                            if (result.status === 'OK' && !angular.isString(data)) {
                                if (data.length >= 0) {
                                    if (data.length <= pageSize) {
                                        strategy.strategyTactics = createTacticObject(clientId, campaign, strategy.id,
                                            data, timePeriod);
                                    } else {
                                        strategy.strategyTactics = createTacticObject(clientId, campaign, strategy.id,
                                            data.slice(0, pageSize), timePeriod);
                                        strategy.strategyTacticsLoadMore = data.slice(pageSize);
                                    }
                                }
                            }

                            callBackFunction && callBackFunction(strategy.id, loadingFlag);
                        });
                    },

                    getTacticData = function (clientId, campaign, strategy, timePeriod, data) {
                        // create tactic object and request cdb and metric data
                        return createTacticObject(clientId, campaign, strategy.id, timePeriod, data);
                    },

                    getTacticsMetrics = function (tactic, tacticMetrics) {
                        if (!angular.isString(tacticMetrics)) {
                            tactic.adFormats = domainReports.checkForCampaignFormat(tacticMetrics.adFormat);
                            tactic.totalImpressions = tacticMetrics.impressions;
                            /*tactic.grossRev = _.find(lineItemData[selectedLineItemId], function(val){
                                return (val.ad_id === tactic.id);
                            });*/
                            /*if(tactic.grossRev && tactic.grossRev.gross_rev) {
                                tactic.grossRev = tactic.grossRev.gross_rev;
                            }*/

                            tactic.ctr = tacticMetrics.ctr * 100;
                            tactic.actionRate = tacticMetrics.action_rate;
                            tactic.vtcData = vtcMetricsJsonModifier(tacticMetrics.video_metrics);

                            tactic.vtc_rate = (tacticMetrics.video_metrics && tacticMetrics.video_metrics ) ?
                                tacticMetrics.video_metrics.vtc_rate : -1;

                            tactic.map = {};
                            tactic.map.impressions = tacticMetrics.impressions;
                            tactic.map.cpa = tacticMetrics.gross_ecpa;
                            tactic.map.cpc = tacticMetrics.gross_ecpc;
                            tactic.map.cpm = tacticMetrics.gross_ecpm;
                            tactic.map.vtc = tacticMetrics.video_metrics.vtc_rate;
                            tactic.map.clicks = tacticMetrics.clicks;
                            tactic.map.action_rate = tacticMetrics.action_rate;
                            tactic.map.ctr = tacticMetrics.ctr * 100;
                            tactic.spend = tacticMetrics.spend;
                        }
                    },

                    getTacticsCdbLineChart = function (clientId, campaign, strategyId, tactic,
                                                       timePeriod, filterStartDate, filterEndDate) {
                        var kpiType = tactic.kpiType,
                            kpiValue = tactic.kpiValue,

                            kpiMap = {
                                cpc: 'gross_ecpc',
                                cpa: 'gross_ecpa',
                                cpm: 'gross_ecpm'
                            };

                        dataService
                            .getCdbTacticsChartData(
                                clientId,
                                campaign.orderId,
                                strategyId,
                                tactic.id,
                                timePeriod,
                                filterStartDate,
                                filterEndDate
                            )
                            .then(function (result) {
                                var kpiTypeLower,
                                    maxDays,
                                    i,
                                    lineData,
                                    tempKpiType;

                                if (result.status === 'success' && !angular.isString(result.data)) {
                                    if (kpiType !== undefined || kpiType !== null) {
                                        kpiTypeLower = angular.lowercase(kpiType);

                                        if (result.data.data.length > 0) {
                                            maxDays = result.data.data;
                                            getTacticsMetrics(tactic, _.last(maxDays));
                                            i = 0;

                                            lineData = _.map(maxDays, function (item) {
                                                item.ctr *= 100;
                                                item.vtc = item.video_metrics.vtc_rate;

                                                tempKpiType = kpiMap[kpiTypeLower] ?
                                                    kpiMap[kpiTypeLower] : kpiTypeLower;

                                                return {
                                                    x: i + 1,
                                                    y: utils.roundOff(item[tempKpiType], 2),
                                                    date: item.date
                                                };
                                            });

                                            tactic.chart = new line.highChart(lineData, parseFloat(kpiValue),
                                                kpiTypeLower, 'tactics');

                                            // d3 chart data
                                            tactic.lineChart = {
                                                data: lineData,
                                                kpiValue: parseFloat(kpiValue),
                                                kpiType: kpiTypeLower,
                                                from: 'tactics',

                                                // for delivery kpi
                                                deliveryData: {
                                                    startDate: tactic.startDate,
                                                    endDate: tactic.endDate,

                                                    totalDays: momentInNetworkTZ.dateDiffInDays(
                                                        tactic.startDate, tactic.endDate) + 1,

                                                    deliveryDays: maxDays.length,
                                                    bookedImpressions: maxDays[maxDays.length - 1].booked_impressions
                                                }
                                            };
                                        } else {
                                            tactic.chart = false;
                                        }
                                    }
                                } else {
                                    tactic.chart = false;
                                }
                            }, function () {
                                tactic.chart = false;
                            });
                    },

                    createStrategyObject = function (clientId, campaign, timePeriod, strategyData, kpiType, kpiValue) {
                        var strategyObj = [],
                            adSize = '',
                            keyValues = '',
                            geos = '';

                        _.each(strategyData, function (strategy) {
                            var strategy1 = {
                                id: strategy.id,
                                brandName: campaign.brandName,
                                name: strategy.name,
                                startDate: momentInNetworkTZ.utcToLocalTime(strategy.start_date, 'YYYY-MM-DD'),
                                endDate: momentInNetworkTZ.utcToLocalTime(strategy.end_date, 'YYYY-MM-DD'),
                                order_id: strategy.order_id,
                                li_status: 'Draft',
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

                            strategy1.durationCompletion = campaign.durationCompletion.bind(strategy1);
                            strategy1.durationLeft = campaign.durationLeft.bind(strategy1);
                            strategy1.daysSinceEnded = campaign.daysSinceEnded.bind(strategy1);
                            strategyObj.push(strategy1);

                            getStrategyCdbLineChart(clientId, campaign, strategy1, timePeriod, kpiType, kpiValue);
                        });

                        return strategyObj;
                    },

                    getStrategyMetrics = function (strategy, strategyMetrics, adFormats) {
                        strategy.adFormats = domainReports.checkForCampaignFormat(adFormats);
                        strategy.totalImpressions = strategyMetrics.impressions;
                        strategy.grossRev = strategyMetrics.gross_rev;
                        strategy.ctr = strategyMetrics.ctr * 100;
                        strategy.actionRate = strategyMetrics.action_rate;
                        strategy.vtcData = vtcMetricsJsonModifier(strategyMetrics.video_metrics);
                        strategy.vtc_rate = strategyMetrics.video_metrics.vtc_rate;
                        strategy.map = {};
                        strategy.map.cpa = strategyMetrics.cpa;
                        strategy.map.cpc = strategyMetrics.cpc;
                        strategy.map.cpm = strategyMetrics.cpm;
                        strategy.map.vtc = strategyMetrics.video_metrics.vtc_rate;
                        strategy.map.clicks = strategyMetrics.clicks;
                        strategy.map.action_rate = strategyMetrics.action_rate;
                        strategy.map.ctr = strategyMetrics.ctr * 100;
                    },

                    getStrategyCdbLineChart = function (clientId, campaign, strategy, timePeriod, kpiType, kpiValue,
                                                        advertiserModel, brandsModel) {
                        selectedLineItemId = strategy.id;

                        dataService
                            .getCdbChartData(clientId, campaign, timePeriod, 'lineitems', strategy.id)
                            .then(function (result) {
                                var kpiTypeLower,
                                    maxDays,
                                    i,
                                    lineData;

                                if (result.status === 'success' &&
                                    !angular.isString(result.data)) { // jshint ignore:line
                                    if (kpiType !== undefined || kpiType !== null) {
                                        kpiTypeLower = angular.lowercase(kpiType); // jshint ignore:line

                                        if (kpiTypeLower === 'action rate') {
                                            kpiTypeLower = 'action_rate';
                                        }

                                        if (result.data.data.measures_by_days.length > 0) {
                                            maxDays = result.data.data.measures_by_days;
                                            var queryObj = {
                                                    queryId: 15,
                                                    clientId: loginModel.getSelectedClient().id,
                                                    advertiserId: advertiserModel.getSelectedAdvertiser().id,
                                                    brandId: brandsModel.getSelectedBrand().id,
                                                    dateFilter: 'life_time',
                                                    campaignId: campaign.id,
                                                    lineitemId: strategy.id
                                                },

                                                spendUrl = urlService.getCampaignSpend(queryObj);
                                            (function (strategy) {
                                                dataService
                                                    .fetch(spendUrl)
                                                    .then(function (response) {
                                                        var res = response.data;
                                                        if (res && res.data &&
                                                            res.data.length > 0) {
                                                            maxDays[maxDays.length - 1].gross_rev =
                                                            res.data[0].gross_rev;
                                                            lineItemData[strategy.id] = res.data;
                                                        } else {
                                                            maxDays[maxDays.length - 1].gross_rev = 0;
                                                        }
                                                        getStrategyMetrics(
                                                            strategy,
                                                            _.last(maxDays), // jshint ignore:line
                                                            result.data.data.adFormats, res.data
                                                        );

                                                        i = 0;

                                                        lineData = _.map(maxDays, function (item) { // jshint ignore:line
                                                            item.ctr *= 100;
                                                            item.vtc = item.video_metrics.vtc_rate;

                                                            return {
                                                                x: i + 1,
                                                                y: utils.roundOff(item[kpiTypeLower], 2),
                                                                date: item.date
                                                            };
                                                        });

                                                        strategy.chart = new line.highChart(
                                                                                            lineData,
                                                                                            parseFloat(kpiValue),
                                                            kpiTypeLower, 'strategy');

                                                        //d3 chart data
                                                        //REVIEW: TARGET -DELIVERY
                                                        if (kpiTypeLower === 'impressions') {
                                                            strategy.targetKPIImpressions =
                                                                maxDays[maxDays.length - 1].booked_impressions;
                                                        }

                                                        strategy.lineChart = {
                                                            data: lineData,
                                                            kpiValue: parseFloat(kpiValue),
                                                            kpiType: kpiTypeLower,
                                                            from: 'strategy',

                                                            //for delivery kpi
                                                            deliveryData: {
                                                                startDate: strategy.startDate,
                                                                endDate: strategy.endDate,
                                                                totalDays: momentInNetworkTZ.dateDiffInDays(
                                                                    strategy.startDate,
                                                                    strategy.endDate) + 1,
                                                                deliveryDays: maxDays.length,
                                                                bookedImpressions:
                                                                maxDays[maxDays.length - 1].booked_impressions
                                                            }
                                                        };
                                                    });
                                            }(strategy));
                                        } else {
                                            strategy.chart = false;
                                        }
                                    }
                                } else {
                                    strategy.chart = false;
                                }
                            }, function () {
                                strategy.chart = false;
                            });
                    },

                    getStrategyList = function (clientId, campaign, timePeriod) {
                        var kpiType = campaign.kpiType,
                            kpiValue = campaign.kpiValue,
                            pageSize = 3,
                            url = '/clients/' + clientId + '/campaigns/' + campaign.orderId + '/lineitems';

                        dataService
                            .getCampaignStrategies(url, 'list')
                            .then(function (result) {
                                var data = result.data.data;

                                if (result.status === 'success' && !angular.isString(data)) {
                                    if (data.length >= 0) {
                                        if (data.length <= pageSize) {
                                            campaign.campaignStrategies = createStrategyObject(data, timePeriod, campaign, kpiType, kpiValue);
                                        } else {
                                            campaign.campaignStrategies = createStrategyObject(data.slice(0, pageSize), timePeriod, campaign, kpiType, kpiValue);

                                            campaign.campaignStrategiesLoadMore = data.slice(pageSize);
                                        }
                                    }
                                }
                            });
                    },

                    getStrategyData = function (clientId, campaign, timePeriod, data) {
                        // this requests strategy data - invoked when requestStrategiesData is called from controller
                        return createStrategyObject(clientId, campaign, timePeriod, data,
                            campaign.kpiType, campaign.kpiValue);
                    },

                    vtcMetricsJsonModifier = function (vtcMetricJson) {
                        var vtcMapper = {
                                vtc_25_perc: 25,
                                vtc_50_perc: 50,
                                vtc_75_perc: 75,
                                vtc_rate: 100
                            },

                            vtcDataToPlot = [],

                            vtcRoundOff = function (input, places) {
                                var factor;

                                places = input > 1 ? 0 : places;
                                factor = Math.pow(10, places);

                                return Math.round(input * factor) / factor;
                            },

                            baseConfiguration = {
                                data: {
                                    json: [vtcDataToPlot],

                                    keys: {
                                        xAxis: {
                                            val: 'vtc',
                                            tickValues: _.pluck(vtcDataToPlot, 'vtc')
                                        },

                                        yAxis: {
                                            val: 'values',
                                            tickValues: []
                                        }
                                    },

                                    margin: {
                                        top: 20,
                                        right: 20,
                                        left: 20,
                                        bottom: 20
                                    },

                                    showPathLabel: true,
                                    showAxisLabel: false,
                                    axisLabel: ['Plays', 'Views']
                                }
                            };

                        _.each(vtcMetricJson, function (value, key) {
                            if (vtcMapper[key]) {
                                vtcDataToPlot.push({
                                    vtc: vtcMapper[key],
                                    values: vtcRoundOff(value, 2)
                                });
                            }
                        });

                        vtcDataToPlot.push({
                            vtc: 0,
                            values: 100
                        });

                        vtcDataToPlot = _.sortBy(vtcDataToPlot, 'vtc');

                        return baseConfiguration;
                    },

                    getCdbLineChart = function (clientId, campaignObject, timePeriod, callback) {
                        dataService
                            .getCdbChartData(clientId, campaignObject, timePeriod, 'campaigns', null)
                            .then(function (result) {
                                var cdData,
                                    kpiType,
                                    kpiValue,
                                    kpiTypeLower,
                                    maxDays,
                                    i,
                                    lineData;

                                campaignObject.chart = true;

                                if (result.status === 'success' && !angular.isString(result.data)) {
                                    if (!angular.isUndefined(campaignObject.kpiType)) {
                                        kpiType = campaignObject.kpiType;
                                        kpiValue = campaignObject.kpiValue;
                                        kpiTypeLower = angular.lowercase(kpiType);

                                        if (kpiTypeLower === 'action rate') {
                                            kpiTypeLower = 'action_rate';
                                        }

                                        if (result.data.data.measures_by_days.length > 0) {
                                            maxDays = result.data.data.measures_by_days;
                                            i = 0;

                                            lineData = _.map(maxDays, function (item) {
                                                item.ctr *= 100;
                                                item.vtc = item.video_metrics.vtc_rate;

                                                return {
                                                    x: i + 1,
                                                    y: utils.roundOff(item[kpiTypeLower], 2),
                                                    date: item.date
                                                };
                                            });

                                            cdData = _.last(maxDays);
                                            cdData.adFormats =
                                                domainReports.checkForCampaignFormat(result.data.data.adFormats);

                                            callback && callback(cdData);
                                            campaignObject.chart = new line.highChart(lineData, parseFloat(kpiValue),
                                                kpiTypeLower, 'campaign');

                                            // d3 chart data
                                            campaignObject.lineChart = {
                                                data: lineData,
                                                kpiValue: parseFloat(kpiValue),
                                                kpiType: kpiTypeLower,
                                                from: 'campaign',

                                                // for delivery kpi
                                                deliveryData: {
                                                    startDate: campaignObject.startDate,
                                                    endDate: campaignObject.endDate,

                                                    totalDays: momentInNetworkTZ.dateDiffInDays(
                                                        campaignObject.startDate, campaignObject.endDate) + 1,

                                                    deliveryDays: maxDays.length,
                                                    bookedImpressions: maxDays[maxDays.length - 1].booked_impressions
                                                }
                                            };
                                        } else {
                                            campaignObject.chart = false;
                                            callback && callback(campaignObject);
                                        }
                                    }
                                } else {
                                    campaignObject.chart = false;
                                    callback && callback(campaignObject);
                                }
                            }, function () {
                                campaignObject.chart = false;
                                callback && callback(campaignObject);
                            });
                    },

                    //exposed methods

                    getCampaigns = function (url, success, failure) {
                        var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_LIST_CANCELLER);

                        return dataService.fetchCancelable(url, canceller, success, failure);
                    },

                    getDashboardData = function (url, success, failure) {
                        var canceller = requestCanceller.initCanceller(constants.DASHBOARD_CANCELLER);

                        return dataService.fetchCancelable(url, canceller, success, failure);
                    },


                    setActiveInactiveCampaigns = function (campaigns, timePeriod, periodStartDate, periodEndDate) {
                        var campaignList = [],
                            campaign;

                        _.each(campaigns, function (camp) {
                            if (!angular.isObject(camp)) {
                                return;
                            }

                            camp.start_date =
                                momentInNetworkTZ.utcToLocalTime(camp.start_date, constants.DATE_UTC_SHORT_FORMAT);

                            camp.end_date =
                                momentInNetworkTZ.utcToLocalTime(camp.end_date, constants.DATE_UTC_SHORT_FORMAT);

                            campaign = modelTransformer.transform(camp, campaignModel);
                            campaign.periodStartDate = periodStartDate;
                            campaign.periodEndDate = periodEndDate;
                            campaign.fromSuffix = utils.formatDate(camp.start_date);
                            campaign.toSuffix = utils.formatDate(camp.end_date);
                            campaign.setVariables();
                            campaign.setMomentInNetworkTz(momentInNetworkTZ);

                           // campaign.kpiType  = campaign.kpiType.toLowerCase().split(' ').join('_');

                            // TODO: set default to DELIVERY if null or undefined
                            if (campaign.kpiType === 'null' || campaign.kpiType === '') {
                                campaign.kpiType = 'IMPRESSIONS';
                                campaign.kpiValue = 0;
                            }
                            if (campaign.kpiType === 'IMPRESSIONS') {
                                campaign.kpiTypeDisplayName = 'Impressions';
                            } else {
                                campaign.kpiTypeDisplayName = _.find(vistoconfig.kpiDropDown, function (obj) {
                                    return obj.kpi === campaign.kpiType;
                                });
                                campaign.kpiTypeDisplayName = campaign.kpiTypeDisplayName ? campaign.kpiTypeDisplayName.displayName : utils.capitaliseAllText(campaign.kpiType);
                            }

                            campaignList.push(campaign);
                        });

                        return campaignList;
                    },

                    //should be moved to costservice inside cost module later
                    getCampaignCostData = function (campaignIds, filterStartDate, filterEndDate, advertiserId, brandId,
                                                   success, failure) {
                        var dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),

                            queryObj = {
                                queryId: 14,
                                clientId: $routeParams.subAccountId || $routeParams.accountId,
                                campaignIds: campaignIds,
                                dateFilter: dateFilter,
                                advertiserId: advertiserId,
                                brandId: brandId
                            },

                            url = urlService.APIVistoCustomQuery(queryObj),
                            canceller = requestCanceller.initCanceller(constants.COST_CANCELLER);

                        return dataService.fetchCancelable(url, canceller, success, failure);
                    },

                    //should be moved to campaign details service
                    getStrategiesList = function (clientId, campaign, timePeriod) {
                        //request list
                        return getStrategyList(clientId, campaign, timePeriod);
                    },

                    moreStrategiesData = function (clientId, campaign, timePeriod, data) {
                        //request metrics and cdb data
                        return getStrategyData(clientId, campaign, timePeriod, data);
                    },

                    getTacticsList = function (clientId, campaign, strategy, timePeriod, callBackFunction) {
                        //request list
                        return getTacticList(clientId, campaign, strategy, timePeriod, callBackFunction);
                    },

                    moreTacticsData = function (strategy, timePeriod, campaign, data) {
                        //request metrics and cdb data
                        return getTacticData(strategy, timePeriod, campaign, data);
                    };

                return {
                    getCampaigns: getCampaigns,
                    getDashboardData: getDashboardData,
                    setListCampaign: setListCampaign,
                    getListCampaign: getListCampaign,
                    getCdbLineChart: getCdbLineChart,
                    vtcMetricsJsonModifier: vtcMetricsJsonModifier,
                    setActiveInactiveCampaigns: setActiveInactiveCampaigns,
                    getCampaignCostData: getCampaignCostData,
                    getStrategiesList: getStrategiesList,
                    moreStrategiesData: moreStrategiesData,
                    getTacticsList: getTacticsList,
                    moreTacticsData: moreTacticsData
                };
            }
        ]);
    }
);
