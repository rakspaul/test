/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("line", function($timeout) {

        var lineChart = function(lineDate, threshold, kpiType) {
            var data = [],
                datObj = [];

            for (var i = 0; i < lineDate.length; i++) {
                datObj[0] = i;
                datObj[1] = lineDate[i]['y'];
                data.push(datObj);
                datObj = [];
            }
         

            return {
                options: {
                    credits: {
                        enabled:false
                    },
                    rangeSelector: {
                        selected: 1
                    },
                    tooltip: {
                        useHTML:true,
                        formatter: function () {
                            return '<div style="background:#fff;padding:5px;border:1px solid #ccc"> <b>' + this.series.name  + '</b><br/>' + this.x + ': ' + this.y+'</div>';
                        }
                    },
                    title: {
                        text: null
                    },
                    legend: {
                        enabled: false
                    },
                    yAxis: {
                        labels: {
                            enabled: false
                        },
                        title: {
                            enabled: false,
                            text: ''
                        },
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        plotBands: [{ // Light air
                            color: '#fbdbd1',
                            label: {
                                enabled: false,
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
                            value: threshold, //threshold,
                            dashStyle: 'longdashdot'
                        }]
                    }
                },
                series: [{
                    name: kpiType,
                    data: data,
                    threshold: threshold,
                    negativeColor: '#6fd0f4',
                    color: '#6fd0f4',
                    tooltip: {
                        valueDecimals: 2
                    }
                }],
                title: {
                    text: ' '
                },
                loading: false,
                func: function(chart) {
                    $timeout(function() {
                        var extremes = chart.yAxis[0].getExtremes();
                        chart.yAxis[0].addPlotBand({ // Light air
                            from: threshold,
                            to: ( kpiType == 'CPC' || kpiType == 'CPA' || kpiType == 'CPM' ) ? extremes.max : extremes.min,
                            color: '#fbdbd1',
                            label: {
                                enabled: false,
                                text: '',
                                style: {
                                    color: 'red'
                                }
                            }
                        });
                    }, 1000);
                }

            };
        };
        return {
            highChart: lineChart
        };
    });
}());