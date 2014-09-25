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
        var createStrategyObject= function(strategyData, timePeriod, campaignId, kpiType, kpiValue) {
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
                    strategyObj.push({
                        id: strategy.id,
                        name: strategy.name,
                        start_date: strategy.start_date,
                        end_date:strategy.end_date,
                        order_id: strategy.order_id,
                        li_status: strategy.li_status ,
                        ad_size: adSize,
                        selected_key_values: keyValues
                    });
                    getStrategyCdbLineChart(index, strategyObj, timePeriod, campaignId, kpiType, kpiValue);
                }
                return strategyObj;
            };

        var getStrategyCdbLineChart= function(obj, strategyList, timePeriod, campaignId, kpiType, kpiValue) {
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
                                    lineData.push({ 'x': i + 1, 'y': parseFloat(maxDays[i][kpiTypeLower]), 'date': maxDays[i]['date'] });
                                }                             
                                strategyList[obj].chart = new line.highChart(lineData, parseFloat(kpiValue), sKpiType);
                            }
                        }
                    }
                });
            };

        return {

            
            getStrategyList: function(obj, campaignList, timePeriod, kpiType, kpiValue) {
                var url = '/orders/' + campaignList[obj].orderId + '/lineitems.json';
                dataService.getCampaignStrategies(url).then(function (result) {
                    var strategyList = [];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(result.data.length <= 3){
                            campaignList[obj].campaignStrategies = createStrategyObject(result.data, timePeriod, campaignList[obj].orderId, kpiType, kpiValue);
                        }else{
                            campaignList[obj].campaignStrategies = createStrategyObject(result.data.slice(0,3), timePeriod,campaignList[obj].orderId, kpiType, kpiValue);
                            campaignList[obj].campaignStrategiesLoadMore = createStrategyObject(result.data.slice(3), timePeriod,campaignList[obj].orderId, kpiType, kpiValue);
                        }
                    }
               });
            },

            getCdbLineChart: function(obj, campaignList, timePeriod) {
                dataService.getCdbChartData(campaignList[obj].orderId, timePeriod, 'campaigns', null).then(function (result) {
                    var lineDate = [];
                    if(result.status == "success" && !angular.isString(result.data)) {
                        if(!angular.isUndefined(campaignList[obj].kpiType)) {
                            if(result.data.data.measures_by_days.length > 0) {
                                var maxDays = result.data.data.measures_by_days;
                                for (var i = 0; i < maxDays.length; i++) {
                                    var kpiType = (campaignList[obj].kpiType),
                                    kpiTypeLower = angular.lowercase(kpiType);
                                    lineDate.push({ 'x': i + 1, 'y': maxDays[i][kpiTypeLower], 'date': maxDays[i]['date'] });

                                }                             
                                campaignList[obj].chart = new line.highChart(lineDate, parseFloat(campaignList[obj].kpiValue), campaignList[obj].kpiType);
                            }
                        }
                    }
                });
            },

            setActiveInactiveCampaigns: function (dataArr, timePeriod) {
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
                        status : dataArr[obj].status || 'draft',
                        kpiType : dataArr[obj].kpi_type,
                        kpiValue : dataArr[obj].kpi_value,
                        totalImpressions: dataArr[obj].total_impressions,
                        totalMediaCost: Math.round(dataArr[obj].total_media_cost),
                        expectedMediaCost: Math.round(dataArr[obj].expected_media_cost || 0),
                        lineitemsCount : dataArr[obj].lineitems_count,
                        campaignStrategies:null,
                        campaignStrategiesLoadMore:null
                    });

                    this.getStrategyList(obj, campaignList, timePeriod, dataArr[obj].kpi_type, dataArr[obj].kpi_value)
                    this.getCdbLineChart(obj, campaignList, timePeriod);

                    
                }
                return campaignList;
            }
        };
    }]);
}());
