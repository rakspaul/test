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
                
                //based on time period use period dates or flight dates
                switch(timePeriod) {
                    case 'last_7_days':
                    case 'last_30_days':
                        //campaign period dates for timefiltering
                        filterStartDate = campaign.periodStartDate;
                        filterEndDate = campaign.periodEndDate;
                        break;
                    case 'life_time':
                    default:
                        //campaign flight dates for timefilter
                        filterStartDate = campaign.startDate;
                        filterEndDate = campaign.endDate;
                }

                getTacticsCdbLineChart(index, tacticObj, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate);
                
                for(var i in campaign.tacticMetrics) {
                    if(campaign.tacticMetrics[i].id == tactic.id){
                        getTacticsMetrics(index, tacticObj, campaign.tacticMetrics[i].data);
                    }
                }
            }
            return tacticObj;
        };

        var getTacticList = function(index, strategyObj, timePeriod, campaign, strategyId, kpiType, kpiValue) {
            dataService.getStrategyTacticList(strategyId).then(function (response) {
                var result = response.data,
                    pageSize = 3;
                if(result.status == "OK" && !angular.isString(result.data)) {
                    if(result.data.length >= 0) {
                        if(result.data.length <= pageSize) {
                            strategyObj[index].strategyTactics = createTacticObject(result.data, timePeriod,campaign, strategyId, kpiType, kpiValue);
                        } else {
                            strategyObj[index].strategyTactics = createTacticObject(result.data.slice(0,pageSize), timePeriod, campaign, strategyId, kpiType, kpiValue);
                            strategyObj[index].strategyTacticsLoadMore = createTacticObject(result.data.slice(pageSize), timePeriod, campaign, strategyId, kpiType, kpiValue);
                        }
                    }
                }
            });

        };
         
        var getTacticsMetrics = function(index, tacticObj, tacticMetrics) {
            if(!angular.isString(tacticMetrics)) {
                tacticObj[index].totalImpressions = tacticMetrics.impressions;
                tacticObj[index].grossRev = tacticMetrics.gross_rev;
                tacticObj[index].ctr = tacticMetrics.ctr * 100;
                tacticObj[index].actionRate = tacticMetrics.action_rate;
                tacticObj[index].map = {};
                tacticObj[index].map['cpa'] = tacticMetrics.gross_ecpa;
                tacticObj[index].map['cpc'] = tacticMetrics.gross_ecpc;
                tacticObj[index].map['cpm'] = tacticMetrics.gross_ecpm;
                tacticObj[index].map['vtc'] = 0;
                tacticObj[index].map['clicks'] = tacticMetrics.clicks;
                tacticObj[index].map['action_rate'] = tacticMetrics.action_rate;
                tacticObj[index].map['ctr'] = tacticMetrics.ctr * 100;
            }
        };

        var getTacticsCdbLineChart = function(obj, tacticsList, timePeriod, campaign, strategyId, kpiType, kpiValue, filterStartDate, filterEndDate) {
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
                            for (var i = 0; i < maxDays.length; i++) {
                                maxDays[i]['ctr'] *= 100
                                var kpiType = kpiMap[sKpiType] ? kpiMap[sKpiType] : sKpiType;
                                var kpiTypeLower = angular.lowercase(kpiType);
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }                             
                            tacticsList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
                        }
                    }
                }
            });
        };

        var createStrategyObject = function(strategyData, timePeriod, campaign, kpiType, kpiValue) {
            var strategyObj = [], adSize = '', keyValues = '', geos = '';
            for(var index in strategyData) {
                var strategy = strategyData[index];
                //Iterating the creatives object
                if(strategy.creatives.length > 0) {
                    adSize = appendStrategyData(strategy.creatives, 'ad_size');
                }

                if(strategy.selected_geos.length > 0) {
                    geos = appendStrategyData(strategy.selected_geos, 'title');
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
                    brandName: campaign.brandName,
                    name: strategy.name,
                    startDate: strategy.start_date,
                    endDate: strategy.end_date,
                    order_id: strategy.order_id,
                    li_status: status,
                    ad_size: adSize,
                    tactics_count: strategy.ads_count || 0,
                    selected_key_values: keyValues,
                    selected_geos: geos,
                    totalImpressions: null,
                    grossRev: null,
                    expectedMediaCost: strategy.expected_media_cost,
                    ctr: 0,
                    actionRate: 0,
                    chart: null
                });
                getStrategyCdbLineChart(index, strategyObj, timePeriod, campaign, kpiType, kpiValue);
                getStrategyMetrics(index, strategyObj, timePeriod, campaign);
                getTacticList(index, strategyObj, timePeriod, campaign, strategyObj[index].id, kpiType, kpiValue);
            }
            return strategyObj;
        };

        var getStrategyMetrics = function(index, strategyObj, timePeriod, campaign) {
          var  durationQuery= 'period=' + timePeriod;
          if(timePeriod === 'life_time') {
            durationQuery = 'start_date=' + strategyObj[index].startDate + '&end_date=' + strategyObj[index].endDate;
          }
          var url = '/campaigns/' + campaign.orderId + '/strategies/' + strategyObj[index].id + '/perf?' + durationQuery;
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
                    strategyObj[index].map['vtc'] = 0;
                    strategyObj[index].map['clicks'] = result.data.data.clicks;
                    strategyObj[index].map['action_rate'] = result.data.data.action_rate;
                    strategyObj[index].map['ctr'] = result.data.data.ctr * 100;
                }
           });
        };

        var getStrategyCdbLineChart = function(obj, strategyList, timePeriod, campaign, kpiType, kpiValue) {
           var sKpiType=kpiType;
            dataService.getCdbChartData(campaign, timePeriod, 'strategies', strategyList[obj].id).then(function (result) {
                var lineData=[];
                if(result.status == "success" && !angular.isString(result.data)) {
                    if(sKpiType != undefined || sKpiType != null) {
                        if(result.data.data.measures_by_days.length > 0) {
                            var maxDays = result.data.data.measures_by_days;
                            for (var i = 0; i < maxDays.length; i++) {
                                var kpiType = (sKpiType);
                                maxDays[i]['ctr'] *= 100
                                var kpiTypeLower = angular.lowercase(kpiType);
                                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                            }                             
                            strategyList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
                        }
                    }
                }
            });
        };

        var getStrategyList = function(obj, campaignList, timePeriod, cdeskTimePeriod, kpiType, kpiValue) {

                var url = '/campaigns/' + campaignList[obj].orderId + '/lineitems.json?filter[date_filter]=' + cdeskTimePeriod;
                dataService.getCampaignStrategies(url, 'list').then(function (result) {

                    var strategyList = [];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(result.data.length >= 0) {
                            if(result.data.length <= 3) {
                                campaignList[obj].campaignStrategies = createStrategyObject(result.data, timePeriod, campaignList[obj], kpiType, kpiValue);
                            } else {
                                campaignList[obj].campaignStrategies = createStrategyObject(result.data.slice(0,3), timePeriod,campaignList[obj], kpiType, kpiValue);
                                campaignList[obj].campaignStrategiesLoadMore = createStrategyObject(result.data.slice(3), timePeriod,campaignList[obj], kpiType, kpiValue);
                            }
                        }
                    }
               });
            };

            var getCdbLineChart = function(obj, campaignList, timePeriod) {
                dataService.getCdbChartData(campaignList[obj], timePeriod, 'campaigns', null).then(function (result) {
                    var lineDate = [];
                    campaignList[obj].chart = true;
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(!angular.isUndefined(campaignList[obj].kpiType)) {
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                for (var i = 0; i < maxDays.length; i++) {
                                    maxDays[i]["ctr"] *= 100;
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
            };

        return {
       
            

            setActiveInactiveCampaigns: function (dataArr, timePeriod, cdeskTimePeriod, periodStartDate, periodEndDate) {
                var status = '',
                    campaignList = [],
                    filterStartDate = '',
                    filterEndDate = '';
               
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

                    campaignList.push({
                        orderId: dataArr[obj].id,
                        periodStartDate: periodStartDate,
                        periodEndDate: periodEndDate,
                        startDate: dataArr[obj].start_date,
                        fromSuffix: utils.formatDate(dataArr[obj].start_date),
                        endDate: dataArr[obj].end_date,
                        toSuffix: utils.formatDate(dataArr[obj].end_date),
                        campaignTitle: dataArr[obj].name,
                        brandName: dataArr[obj].brand_name,
                        status: dataArr[obj].status || 'draft',
                        statusIcon : status,
                        kpiType: dataArr[obj].kpi_type,
                        kpiValue: dataArr[obj].kpi_value,
                        //kpiType: 'vtc',
                        //kpiValue: 10,
                        totalImpressions: dataArr[obj].total_impressions,
                        totalMediaCost: Math.round(dataArr[obj].total_media_cost || 0),
                        expectedMediaCost: Math.round(dataArr[obj].expected_media_cost || 0),
                        lineitemsCount: dataArr[obj].lineitems_count,
                        actionsCount: dataArr[obj].actions_count || 0,
                        campaignStrategies:null,
                        tacticMetrics: [],
                        chart:true,
                        campaignStrategiesLoadMore:null
                    });

                    //based on time period use period dates or flight dates
                    switch(timePeriod) {
                        case 'last_7_days':
                        case 'last_30_days':
                            //campaign period dates for timefiltering
                            filterStartDate = periodStartDate;
                            filterEndDate = periodEndDate;
                            break;
                        case 'life_time':
                        default:
                            //campaign flight dates for timefilter
                            filterStartDate = dataArr[obj].start_date;
                            filterEndDate = dataArr[obj].end_date;
                    }

                    dataService.getCdbTacticsMetrics(dataArr[obj].id, filterStartDate, filterEndDate).then(function (result) {
                        if(result.status == "success" && !angular.isString(result.data)) { 
                                if(result.data.data.length > 0) {
                                    var tacticsData = result.data.data;
                                    for (var i = 0; i < tacticsData.length; i++) {
                                        campaignList[obj].tacticMetrics.push({id: tacticsData[i].ad_id, data: tacticsData[i]});
                                    }      
                                }
                        }
                        
                    });
                    
                    getStrategyList(obj, campaignList, timePeriod, cdeskTimePeriod, dataArr[obj].kpi_type, dataArr[obj].kpi_value)
                    getCdbLineChart(obj, campaignList, timePeriod);

                }
                return campaignList;
            }
        };
    }]);
}());
