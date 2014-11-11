(function() {
    "use strict";
    angObj.factory("columnline", function($timeout) {

        var columnChart = function(chartData, kpIType) {
            /*console.log("======================");
             console.log("kpIType :"+ kpIType);
             console.log("======================");*/

            var xData = [],
                impLine = [],
                kpiColumn = [];
            for (var i = 0; i < chartData.length; i++) {
                //xData.push(chartData[i].domain_data);
                xData.push({custom: i, y: chartData[i].domain_data });
                impLine.push(chartData[i].impressions);
                kpiColumn.push(chartData[i].kpi_value);
            }
            var i = 1;
            return {

                //This is not a highcharts object. It just looks a little like one!
                options: {
                    //This is the Main Highcharts chart config. Any Highchart options are valid here.
                    //will be ovverriden by values specified below.
                    chart: {
                        type: 'column',
                        width: 400,
                        height: 260,
                        margin: [20, 40, 30, 40]
                    },
                    /* plotOptions: {
                     column: {
                     dataLabels: {
                     inside: true,
                     enabled: true,
                     verticalAlign:'bottom',
                     color: '#ffffff',
                     style: {
                     fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif', // default font
                     fontSize: '14px',
                     fontWeight: 'bold'
                     },
                     formatter: function () {
                     return parseInt(this.point.category.custom + 1);
                     }
                     }
                     }
                     },*/

                    colors: [
                        '#2e8ed3',
                        '#45a1e3',
                        '#76bef2',
                        '#8ccdfc',
                        '#d2dee7'
                    ],
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        formatter: function() {
                            if (this.key) {
                                var currency =(kpIType === 'CTR' || this.series.name !== 'Series 1')? '' : '$';
                                return  this.key.y +' : '+currency+''+Math.round(Highcharts.numberFormat(this.y, 1));
                            } else {
                                return  '';
                            }
                        },

                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    },
                    xAxis: {
                        categories: xData,
                        lineWidth: 1,
                        minorGridLineWidth: 0,
                        gridLineWidth: 0,
                        lineColor: 'grey',
                        tickWidth: 0,
                        labels: {

                            enabled: true,
                            formatter: function() {
                                if (this) {
                                    return parseInt(i++);
                                } else {
                                    return  '';
                                }
                            }


                        },
                        title: {
                            align: 'high',
                            offset: 5,
                            text: '',
                            rotation: 0,
                            y: -5
                        }
                    },

                    yAxis: [{ // Primary yAxis
                        labels: {
                            enabled: true,
                            formatter: function() {
                                if (this.value) {
                                    return Highcharts.numberFormat(this.value, 1);
                                } else {
                                    return Highcharts.numberFormat(this.value, 1);
                                }
                            }
                        },
                        tickWidth: 1,
                        lineWidth: 1,
                        gridLineWidth: 0,
                        //lineColor: 'grey',
                        minorGridLineWidth: 0,
                        opposite: true,

                        title: {
                            align: 'high',
                            offset: 5,
                            text: 'Imps.',
                            rotation: 0,
                            y: -5,
                            x: -20
                        }
                    }, { // Secondary yAxis
                        title: {
                            align: 'high',
                            offset: 5,
                            text: kpIType,
                            rotation: 0,
                            y: -5,
                            x: 40
                        },
                        labels: {
                            enabled: true,
                            formatter: function() {
                                if (this.value) {
                                    var currency =(kpIType === 'CTR')? '' : '$';
                                    return currency + Highcharts.numberFormat(this.value, 1);
                                } else {
                                    return Highcharts.numberFormat(this.value, 1);
                                }
                            }
                        },
                        lineWidth: 1,
                        tickWidth: 1,
                        gridLineWidth: 0,
                        //lineColor: 'grey',
                        minorGridLineWidth: 0,
                        opposite: false

                    }],
                    //Title configuration (optional)
                    title: {
                        text: ' '
                    }
                },
                //Series object (optional) - a list of series using normal highcharts series options.
                series: [{
                    name: '',
                    type: 'column',
                    yAxis: 1,
                    data: kpiColumn,
                    tooltip: {

                        enabled: false
                        // valueSuffix: ' mm'
                        //pointFormat: "{point.y:.2f}",

                    }
                }, {
                    name: '',
                    type: 'line',
                    data: impLine,
                    tooltip: {
                        enabled: false
                        //pointFormat: "{point.y:.2f}",

                        //valueSuffix: '°C'
                    },
                    color: '#00bff0',
                    marker: {
                        enabled: true,
                        fillColor: '#0978c9'
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }],

                //Boolean to control showng loading status on chart (optional)
                loading: false,

                //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
                useHighStocks: false,
                //size (optional) if left out the chart will default to size of the div or something sensible.

                //function (optional)
                func: function(chart) {
                    //setup some logic for the chart
                }

            };
            
        };
        return {
            highChart: columnChart
        };
    });
}());