/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("line", function($timeout) {

        var lineChart = function(lineDate, threshold, kpiType) {
            var data = [],
                datObj = [];

            for (var i = 0; i < lineDate.length; i++) {
                var chartDate = lineDate[i]['date'].split("-");
                data.push([
                    Date.UTC(parseInt(chartDate[0]), parseInt(chartDate[1], 10) - 1 , parseInt(chartDate[2])),
                    lineDate[i]['y'] 
                ]);
            }
         
            return {
                credits: {
                    enabled: false
                },
                rangeSelector: {
                    selected: 1
                },
                tooltip: {
                    useHTML: true,
                    dateTimeLabelFormats: {
                        day: '%e of %b'
                    },
                    formatter: function () {
                        return '<div class="chart-tool-tip" >' + this.series.name  + '<br/>' + Highcharts.dateFormat('%e', this.value) + '-' + Highcharts.dateFormat('%b', this.value) + ': ' + this.y + '</div>';
                    }
                },
                title: {
                    text: null
                },
                legend: {
                    enabled: false
                },
                xAxis: [{
                    type: 'datetime',
                    labels: {
                        formatter: function() {
                            if(this.isFirst) {
                                  return Highcharts.dateFormat('%e', this.value);
                            } else {
                                  return Highcharts.dateFormat('%e', this.value);
                            }
                
                        }
                    },
                    tickInterval: 1 * 24 * 3600 * 1000
                },
                {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    minorTickLength: 0,
                    tickLength: 0,
                    type: 'datetime',
                    labels: {
                        formatter: function() {
                            return Highcharts.dateFormat('%b', this.value);
                        }
                    }
                    //do not delete this -> tickInterval: 7*24 * 3600 * 1000,
                }],
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
                        value: threshold, 
                        dashStyle: 'longdashdot'
                    }]
                },
                series: [{
                    name: kpiType,
                    data: data,
                    threshold: threshold,
                    negativeColor: '#6fd0f4',
                    color: '#6fd0f4',
                    marker: {
                        enabled: false
                    },
                    states:{
                        hover: {
                            enabled: false
                        }
                    }
                }],
              
                loading: false,
                func: function(chart) {
                    $timeout(function() {
                        var extremesX = chart.xAxis[0].getExtremes();
                        chart.xAxis[1].setExtremes(extremesX.min - 0.5 , extremesX.max + 0.5);
                        var extremes = chart.yAxis[0].getExtremes();
                        chart.yAxis[0].addPlotBand({ // Light air
                            from: threshold,
                            to: (kpiType == 'CPC' || kpiType == 'CPA' || kpiType == 'CPM') ? extremes.max : extremes.min,
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