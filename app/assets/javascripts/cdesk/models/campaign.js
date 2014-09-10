/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("campaign", ["dataService", "utils", function (dataService,  utils) {
        return {
            setActiveInactiveCampaigns: function (dataArr) {
                var campaignList = [], obj;
                for (obj in dataArr) {
                    if (angular.isObject(dataArr[obj])) {

                        // (function (obj) {
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
                            lineitemsCount : dataArr[obj].lineitems_count
                        });
                        //this.campaignSummaryDetails(obj, campaignList);

                        // }) (obj);
                    }
                }
                if (JSON.stringify(campaignList).length > 2) {
                    return campaignList;
                }
            },

            setCdbChart: function (dataArr) {
                var chartConfig ={
                    options: {
                                 rangeSelector: {
                                selected: 1
                            },

                            title: {
                                text: null
                            },
                            legend:{
                                enabled:false
                            },
                        yAxis: {
                            labels:{
                           enabled:false
                       },
                                    title: {
                                        enabled:false,
                                        text: ''
                                    },
                                gridLineWidth: 0,
                                    minorGridLineWidth: 0,
                                plotBands: [{ // Light air
                                    from: 15,
                                    to: 60,
                                   color:'#fbdbd1',/*rgba(255, 0, 0, 0.1)',*/
                                   
                                    label: {
                                        enabled:false,
                                        text: '',
                                        style: {
                                            color: 'red'
                                        }
                                    }
                                }],
                                plotLines: [{ 
                                    label: {
                                        text: 'Baseline',
                                        x: 25
                                    },
                                    color: 'orange',
                                    width: 0,
                                    value: 15,
                                    dashStyle: 'longdashdot'
                                }],
                            }
                            },
                            series: [{
                                name: 'KPN12345',
                                data: [
                                    
                                    [1361404800000, 40],
                                    [1361491200000, 6],
                                    [1361836800000, 5],
                                    [1361923200000, 10],
                                    [1362009600000, 17],
                                    [1362096000000,20],
                                    [1362441609900, 10]

                                ],
                                threshold: 15,
                                negativeColor: '#6fd0f4', /*54b2f9*/
                                color: '#00FF00',/*14af00*/
                                tooltip: {
                                    valueDecimals: 2
                                }
                            }],
                            title: {
                                text: ''
                            },

                            
                        };

               
                    return chartConfig;
                
            }



        };
    }]);
}());