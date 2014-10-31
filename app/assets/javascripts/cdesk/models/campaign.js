/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("campaign", ["dataService", "utils", "common", "line", function (dataService,  utils, common, line) {
        
        var appendStrategyData = function(obj, key) {
            var str = '';
            for(var c in obj){
                str += obj[c][key] + ' ';
            }
            return str.substring(0, str.length - 1);
        };

        var appendZipData = function(obj) {
            var str = '';
            for(var c in obj){
                str += obj[c] + ', ';
            }
            return str.substring(0, str.length - 1);
        };

        var createTacticObject = function(tacticData, timePeriod, campaignId, strategyId, kpiType, kpiValue) {
            var tacticObj = [], 
                status = '', 
                adSize = '', 
                geoValues = '', 
                zipValues = '';

            for(var index in tacticData) {
                var tactic = tacticData[index];

                if(tactic.targeting.audience_targeting.length > 0) {
                    adSize = appendStrategyData(tactic.targeting.audience_targeting, 'title');
                }

                if(tactic.targeting.geo_targeting.length > 0) {
                     geoValues = appendStrategyData(tactic.targeting.geo_targeting, 'title');
                }

                if(tactic.targeting.zip_targeting.length > 0) {
                     zipValues = appendZipData(tactic.targeting.zip_targeting);
                }

                if(tactic.status === undefined || tactic.status.toLowerCase() == "ready"){
                    status = "Draft";
                }else{
                    status = tactic.status;
                }

                tacticObj.push({
                    id: tactic.id,
                    name: tactic.name,
                    startDate: tactic.start_date,
                    endDate: tactic.end_date,
                    ad_size: tactic.ad_size,
                    platform_name: tactic.platform_name,
                    platform_icon: tactic.platform_icon_url,
                    status: status,
                    audience_targeting: adSize || null,
                    zip_targeting: zipValues,
                    geo_targeting: geoValues,
                    totalImpressions: tactic.impressions,
                    grossRev: null,
                    expectedMediaCost: tactic.media_cost,
                    ctr: 0,
                    actionRate: 0,
                    chart: null
                });
                //Once CDB for tactics is ready fire these calls
                //getTacticsCdbLineChart(index, tacticObj, timePeriod, campaignId, strategyId, kpiType, kpiValue);
                //getTacticsMetrics(index, tacticObj, timePeriod, campaignId, strategyId);
            }
            return tacticObj;
        };

        var getTacticList = function(index, strategyObj, timePeriod, campaignId, strategyId, kpiType, kpiValue) {
            dataService.getStrategyTacticList(strategyId).then(function (response) {
                var result = response.data,
                    pageSize = 3;
                if(result.status == "OK" && !angular.isString(result.data)) {
                    if(result.data.length >= 0) {
                        if(result.data.length <= pageSize) {
                            strategyObj[index].strategyTactics = createTacticObject(result.data, timePeriod, strategyId, kpiType, kpiValue);
                        } else {
                            strategyObj[index].strategyTactics = createTacticObject(result.data.slice(0,pageSize), timePeriod, campaignId, strategyId, kpiType, kpiValue);
                            strategyObj[index].strategyTacticsLoadMore = createTacticObject(result.data.slice(pageSize), timePeriod, campaignId, strategyId, kpiType, kpiValue);
                        }
                    }
                }
            });

        };

        var getTacticsMetrics = function(index, tacticObj, timePeriod, campaignId, strategyId) {
            var url = '/campaigns/' + campaignId + '/strategies/' + tacticObj[index].id + '?period=' + timePeriod; 
            dataService.getCampaignStrategies(url, 'metrics').then(function (result) {
                if(result.status == "success" && !angular.isString(result.data.data)) {
                    tacticObj[index].totalImpressions = result.data.data.impressions;
                    tacticObj[index].grossRev = result.data.data.gross_rev;
                    tacticObj[index].ctr = result.data.data.ctr * 100;
                    tacticObj[index].actionRate = result.data.data.action_rate;
                    tacticObj[index].map = {};
                    tacticObj[index].map['cpa'] = result.data.data.cpa;
                    tacticObj[index].map['cpc'] = result.data.data.cpc;
                    tacticObj[index].map['cpm'] = result.data.data.cpm;
                    tacticObj[index].map['clicks'] = result.data.data.clicks;
                    tacticObj[index].map['action_rate'] = result.data.data.action_rate;
                    tacticObj[index].map['ctr'] = result.data.data.ctr * 100;
                }
           });
        };

        var getTacticsCdbLineChart = function(obj, tacticsList, timePeriod, campaignId, strategyId, kpiType, kpiValue) {
           var sKpiType=kpiType;
            dataService.getCdbChartData(campaignId, timePeriod, 'strategies', tacticsList[obj].id).then(function (result) {
                var lineData=[];
                if(result.status == "success" && !angular.isString(result.data)) {
                    if(sKpiType != undefined || sKpiType != null) {
                        if(result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                                var kpiType = (sKpiType);
                                var kpiTypeLower = angular.lowercase(kpiType);
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }                             
                            tacticsList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
                        }
                    }
                }
            });
        };

        var createStrategyObject = function(strategyData, timePeriod, campaignId, kpiType, kpiValue) {
            var strategyObj = [], adSize = '', keyValues = '';
            for(var index in strategyData) {
                var strategy = strategyData[index];
                //Iterating the creatives object
                if(strategy.creatives.length > 0) {
                    adSize = appendStrategyData(strategy.creatives, 'ad_size');
                }

                if(strategy.selected_key_values.length > 0) {
                     keyValues = appendStrategyData(strategy.selected_key_values, 'title');
                }
                var status;
                if(strategy.li_status == "Ready"){
                    status = "Draft";
                }else{
                    status = strategy.li_status;
                }
                strategyObj.push({
                    id: strategy.id,
                    name: strategy.name,
                    startDate: strategy.start_date,
                    endDate: strategy.end_date,
                    order_id: strategy.order_id,
                    li_status: status,
                    ad_size: adSize,
                    tactics_count: strategy.ads_count || 0,
                    selected_key_values: keyValues,
                    totalImpressions: null,
                    grossRev: null,
                    expectedMediaCost: strategy.expected_media_cost,
                    ctr: 0,
                    actionRate: 0,
                    chart: null
                });
                getStrategyCdbLineChart(index, strategyObj, timePeriod, campaignId, kpiType, kpiValue);
                getStrategyMetrics(index, strategyObj, timePeriod, campaignId);
                getTacticList(index, strategyObj, timePeriod, campaignId, strategyObj[index].id, kpiType, kpiValue);
            }
            return strategyObj;
        };

        var getStrategyMetrics = function(index, strategyObj, timePeriod, campaignId) {
            var url = '/campaigns/' + campaignId + '/strategies/' + strategyObj[index].id + '?period=' + timePeriod; 
            dataService.getCampaignStrategies(url, 'metrics').then(function (result) {
                if(result.status == "success" && !angular.isString(result.data.data)) {
                    strategyObj[index].totalImpressions = result.data.data.impressions;
                    strategyObj[index].grossRev = result.data.data.gross_rev;
                    strategyObj[index].ctr = result.data.data.ctr * 100;
                    strategyObj[index].actionRate = result.data.data.action_rate;
                    strategyObj[index].map = {};
                    strategyObj[index].map['cpa'] = result.data.data.cpa;
                    strategyObj[index].map['cpc'] = result.data.data.cpc;
                    strategyObj[index].map['cpm'] = result.data.data.cpm;
                    strategyObj[index].map['clicks'] = result.data.data.clicks;
                    strategyObj[index].map['action_rate'] = result.data.data.action_rate;
                    strategyObj[index].map['ctr'] = result.data.data.ctr * 100;
                }
           });
        };

        var getStrategyCdbLineChart = function(obj, strategyList, timePeriod, campaignId, kpiType, kpiValue) {
           var sKpiType=kpiType;
            dataService.getCdbChartData(campaignId, timePeriod, 'strategies', strategyList[obj].id).then(function (result) {
                var lineData=[];
                if(result.status == "success" && !angular.isString(result.data)) {
                    if(sKpiType != undefined || sKpiType != null) {
                        if(result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                                var kpiType = (sKpiType);
                                var kpiTypeLower = angular.lowercase(kpiType);
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }                             
                            strategyList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
                        }
                    }
                }
            });
        };

        return {
       
            getStrategyList: function(obj, campaignList, timePeriod, cdeskTimePeriod, kpiType, kpiValue) {

                var url = '/campaigns/' + campaignList[obj].orderId + '/lineitems.json?filter[date_filter]=' + cdeskTimePeriod;
                dataService.getCampaignStrategies(url, 'list').then(function (result) {

                    var strategyList = [];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(result.data.length >= 0) {
                            if(result.data.length <= 3) {
                                campaignList[obj].campaignStrategies = createStrategyObject(result.data, timePeriod, campaignList[obj].orderId, kpiType, kpiValue);
                            } else {
                                campaignList[obj].campaignStrategies = createStrategyObject(result.data.slice(0,3), timePeriod,campaignList[obj].orderId, kpiType, kpiValue);
                                campaignList[obj].campaignStrategiesLoadMore = createStrategyObject(result.data.slice(3), timePeriod,campaignList[obj].orderId, kpiType, kpiValue);
                            }
                        }
                    }
               });
            },

            getCdbLineChart: function(obj, campaignList, timePeriod) {
                dataService.getCdbChartData(campaignList[obj].orderId, timePeriod, 'campaigns', null).then(function (result) {
                    var lineDate = [];
                    campaignList[obj].chart = true;
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(!angular.isUndefined(campaignList[obj].kpiType)) {
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                for (var i = 0; i < maxDays.length; i++) {
                                    var kpiType = (campaignList[obj].kpiType),
                                    kpiTypeLower = angular.lowercase(kpiType);
                                    lineDate.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                }
                                campaignList[obj].chart = new line.highChart(lineDate, parseFloat(campaignList[obj].kpiValue), campaignList[obj].kpiType);
                            }
                        }
                    }else{
                            campaignList[obj].chart = false;
                    }
                });
            },

            setActiveInactiveCampaigns: function (dataArr, timePeriod, cdeskTimePeriod) {
                var campaignList = [];
               
                for (var obj in dataArr) {
                    if (!angular.isObject(dataArr[obj])) {
                        continue;
                    }

                    campaignList.push({
                        orderId: dataArr[obj].id,
                        startDate: dataArr[obj].start_date,
                        fromSuffix: utils.formatDate(dataArr[obj].start_date),
                        endDate: dataArr[obj].end_date,
                        toSuffix: utils.formatDate(dataArr[obj].end_date),
                        campaignTitle: dataArr[obj].name,
                        brandName: dataArr[obj].brand_name,
                        status: dataArr[obj].status || 'draft',
                        kpiType: dataArr[obj].kpi_type,
                        kpiValue: dataArr[obj].kpi_value,
                        totalImpressions: dataArr[obj].total_impressions,
                        totalMediaCost: Math.round(dataArr[obj].total_media_cost),
                        expectedMediaCost: Math.round(dataArr[obj].expected_media_cost || 0),
                        lineitemsCount: dataArr[obj].lineitems_count,
                        actionsCount: dataArr[obj].actions_count || 0,
                        campaignStrategies:null,
                        chart:true,
                        campaignStrategiesLoadMore:null
                    });

                    this.getStrategyList(obj, campaignList, timePeriod, cdeskTimePeriod, dataArr[obj].kpi_type, dataArr[obj].kpi_value)
                    this.getCdbLineChart(obj, campaignList, timePeriod);

                    
                }
                return campaignList;
            }
        };
    }]);
}());
