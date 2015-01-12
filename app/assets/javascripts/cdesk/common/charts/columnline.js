(function() {
    "use strict";
    commonModule.factory("columnline", function($timeout, utils) {


        var  getRepString = function(x) {
            //if(isNaN(x)) return x;
            var y = Math.abs(x);

            if(y < 9999) {
                return x;
            }

            if(y < 1000000) {
                return Math.round(x/1000) + "K";
            }
            if( y < 10000000) {
                return (x/1000000).toFixed(2) + "M";
            }

            if(y < 1000000000) {
                return Math.round((x/1000000)) + "M";
            }

            if(y < 1000000000000) {
                return Math.round((x/1000000000)) + "B";
            }

            return "1T+";
        };
        var columnChart = function(chartData, kpIType) {

            var xData = [],
                impLine = [],
                kpiColumn = [];

            for (var i = 0; i < chartData.length; i++) {
                var kpi_value = chartData[i].kpi_value ;
                if(kpIType.toLowerCase() === 'ctr' || kpIType.toLowerCase() === 'action_rate' || kpIType.toLowerCase() === 'action rate' ||  kpIType.toLowerCase() === 'vtc'){
                    kpi_value = kpi_value * 100 ;
                }
                xData.push({custom: i, y: chartData[i].domain_data });
                impLine.push(chartData[i].impressions);
                kpiColumn.push(kpi_value);
               // kpiColumn.push(chartData[i].kpi_value);
            }


            return {
                options: {
                    chart: {
                        type: 'column',
                        width: 450,
                        height: 260,
                        margin: [20, 80, 30, 85] // [marginTop, marginRight, marginBottom and marginLeft]
                    },

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
                                var yVal = this.y;
                                if(this.series.name !== 'Series 1'){
                                    yVal = Highcharts.numberFormat(Math.round(this.y), 0);
                                    return this.key.y +' : ' + yVal;
                                } else {
                                 return ((kpIType === 'CTR' || kpIType === 'action_rate' || kpIType.toLowerCase() === 'action rate' || kpIType.toLowerCase() === 'vtc')) ?  (this.key.y +' : ' + yVal + '%') : (this.key.y +' : ' + yVal + '$') ;
                                }

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
                                    return parseInt(this.value.custom + 1);
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

                              //  if (this.value) {
                                    return getRepString(this.value);
                              /*  } else {
                                    return '';
                                }*/
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
                            text: 'Imps',
                            rotation: 0,
                            y: -10,
                            x: 33
                        }
                    }, { // Secondary yAxis
                        title: {
                            align: 'high',
                            offset: 5,
                            text:kpIType,
                            rotation: 0,
                            y: -10,
                            x: -10
                        },
                        labels: {
                            enabled: true,
                            formatter: function() {
                               // if (!isNaN(this.value)) {
                                    var currency =(kpIType === 'CTR')? '' : '$';
                                    var $returnLabel =  currency + Highcharts.numberFormat(this.value, 2);
                                    return $returnLabel;
                               /* } else {
                                    return '';
                                }*/
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


                    $timeout(function() {
                        if(utils.allValuesSame(impLine)) {
                            if(chart !== undefined && chart.xAxis !== undefined){
                                var extremesX = chart.yAxis[0].getExtremes();
                                chart.yAxis[0].setExtremes(0, extremesX.max * 2);
                            }
                        }
                    //setup some logic for the chart
                }, 1000);
                }

            };
            
        };
        return {
            highChart: columnChart
        };
    });
}());