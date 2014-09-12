/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("campaign", ["dataService", "utils", "common", "line", function (dataService,  utils, common, line) {
        return {
            getCdbLineChart:function(obj, campaignList){
                dataService.getCdbChartData(campaignList[obj].orderId).then(function (result) {
                    var lineDate=[];
                    if(!common.useTempData){
                            if(result.status == "success") {
                                if(!angular.isUndefined(campaignList[obj].kpiType)){
                                    if (result.data.data.measures_by_days.length >= 0) {
                                        var maxDays = result.data.data.measures_by_days;
                                        for (var i = 0; i < maxDays.length; i++) {
                                            var kpiType = (campaignList[obj].kpiType);
                                            if(kpiType !== null) {
                                                lineDate.push({ 'x': i + 1,'y': maxDays[i][kpiType.toLowerCase()]});
                                            }
                                        }
                                        campaignList[obj].chart = new line.highChart(lineDate, campaignList[obj].kpiValue);
                                    }
                                }
                            }
                    }else{
                            console.log(result.data.orders);
                           /* if (result.data.orders.length > 0) {

                                $scope.chartCdbConfig = campaign.setCdbChart(result.data.orders);

                            }*/
                    }//end of check
                });
            },
            setActiveInactiveCampaigns: function (dataArr) {
                var campaignList = [], obj;
                for (obj in dataArr) {
                    if (angular.isObject(dataArr[obj])) {

                         //(function (obj) {
                            campaignList.push({
                                orderId: dataArr[obj].id,
                                startDate: dataArr[obj].start_date,
                                fromSuffix: utils.formatDate(dataArr[obj].start_date),
                                endDate: dataArr[obj].end_date,
                                toSuffix: utils.formatDate(dataArr[obj].end_date),
                                campaignTitle: dataArr[obj].name,
                                brandName: dataArr[obj].brand_name,
                                status : dataArr[obj].status,
                                kpiType : dataArr[obj].kpi_type,
                                kpiValue : dataArr[obj].kpi_value,
                                totalImpressions: dataArr[obj].total_impressions,
                                totalMediaCost: dataArr[obj].total_media_cost,
                                lineitemsCount : dataArr[obj].lineitems_count
                            });
                            this.getCdbLineChart(obj, campaignList);
                        // }) (obj);
                    }
                }
                if (JSON.stringify(campaignList).length > 2) {
                    return campaignList;
                }
            }

            //setCdbChart
             



        };
    }]);
}());
