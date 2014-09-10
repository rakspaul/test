/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("line", function ($timeout) {

        var lineChart = function (data1, data2, data3, data4, categories, pointStart, pointInterval) {
            var data1 = [1, 2, 3, 2, 4, 5, 6, 5, 7, 8, 9];
            var data2 = [
                [0, 8],
                [1, 7],
                [10, 1]
            ];
            var data3 = [
                [0, 2.2],
                [1, 3],
                [10, 3]
            ];
            var data4 = [
                [0, 0],
                [1, 0],
                [10, 7]
            ];


            var categories = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
            var pointStart = 1404390599000;
            var pointInterval = 86400000;

            return {
                options: {
                    chart: {
                        type: 'line',
                        style: {
                            fontFamily: 'Geneva, Tahoma, Verdana, sans-serif'
                        }
                    },
                    title: {
                        text: 'Chart Test Example',
                        style: {
                            fontSize: '1em',
                            fontWeight: 'bold'
                        }
                    },
                    tooltip: {
                        shared: true,
                        crossHairs: true,
                        useHTML: true
                    },
                    plotOptions: {
                        line: {
                            lineWidth: 3,
                            color: 'rgba(0,54,104,1)',
                            marker: {
                                enabled: false,
                                symbol: 'circle',
                                radius: 4
                            }
                        },
                        area: {
                            lineWidth: 0,
                            showInLegend: false,
                            enableMouseTracking: false,
                            stacking: 'normal',
                            color: 'rgba(238,46,47,.25)',
                            fillColor: 'rgba(238,46,47,.25)',
                            marker: {
                                enabled: false
                            }
                        },
                        series: {
                            shadow: false
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        //categories: categories,
                        lineColor: '#000',
                        lineWidth: .5,
                        tickWidth: .5,
                        tickLength: 3,
                        tickColor: '#000',
                        title: {
                            text: 'X Axis',
                            style: {
                                color: '#000',
                                fontSize: '.8em'
                            }
                        }
                    },
                    yAxis: {
                        enabled: false,
                        min: 0,
                        max: 10,
                        maxPadding: 0,
                        lineColor: '#000',
                        lineWidth: .5,
                        tickWidth: .5,
                        tickLength: 3,
                        tickColor: '#000',
                        gridLineWidth: .5,
                        gridLineColor: '#eee',
                        title: {
                            text: ' '
                        }
                    }
                },
                series: [
                    {
                        name: 'Fill',
                        data: data2,
                        type: 'area'
                    },
                    {
                        name: 'Fill',
                        data: data3,
                        type: 'area',
                        color: 'rgba(255,255,255,0)',
                        fillColor: 'rgba(255,255,255,0)'
                    },
                    {
                        name: 'Fill',
                        data: data4,
                        type: 'area'
                    }
                ],
                title: {
                    text: ' '
                },
                loading: false,
                func: function (chart) {
                    //setup some logic for the chart
                    $timeout(function () {
                        chart.addSeries({ name: 'Series A', data: data1 });
                    }, 1000);

                }
            };
            };
        return {
            highChart : lineChart
        };
    });
}());