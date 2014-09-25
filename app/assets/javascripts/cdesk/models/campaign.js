/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("campaign", ["dataService", "utils", "common", "line", function (dataService,  utils, common, line) {
        return {
            getCdbLineChart: function(obj, campaignList, timePeriod) {
                dataService.getCdbChartData(campaignList[obj].orderId, timePeriod).then(function (result) {
                    var lineDate=[];
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
                        lineitemsCount : dataArr[obj].lineitems_count
                    });
                    this.getCdbLineChart(obj, campaignList, timePeriod);
                }
                return campaignList;
            }
        };
    }]);
}());
