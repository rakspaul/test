/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("line", function($timeout) {

        var lineChart = function(lineDate, threshold) {
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
                    credits:{
                        enabled:false
                    },
                    rangeSelector: {
                        selected: 1
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
                            from: threshold,
                            to: 0,
                            color: '#fbdbd1',
                            /*rgba(255, 0, 0, 0.1)',*/

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
                    name: 'KPN: ',
                    data: data,
                    threshold: threshold,
                    negativeColor: '#6fd0f4',
                    /*54b2f9*/
                    color: '#6fd0f4',
                    /*14af00*/
                    tooltip: {
                        valueDecimals: 2
                    }
                }],
                title: {
                    text: ' '
                },
                loading: false,
                func: function(chart) {
                    //setup some logic for the chart
                    $timeout(function() {
                        var extremes = chart.yAxis[0].getExtremes();
                        //console.log(extremes);
                        chart.yAxis[0].addPlotBand({ // Light air
                            from: threshold,
                            to: extremes.max,
                            color: '#fbdbd1',
                            /*rgba(255, 0, 0, 0.1)',*/

                            label: {
                                enabled: false,
                                text: '',
                                style: {
                                    color: 'red'
                                }
                            }
                        });
                        //this.options.plotBands.to = extremes.max;
                        //chart.addSeries({ name: 'Series A', data: data1 });
                    }, 1000);

                }
            };
        };
        return {
            highChart: lineChart
        };
    });
}());