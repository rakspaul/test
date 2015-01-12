/*global angObj, angular*/
(function() {
    "use strict";
    commonModule.factory("line", function($timeout) {

        var lineChart = function(lineDate, threshold, kpiType,chartFrom) {

            var data = [],
                datObj = [];
                switch(chartFrom) {
                    case 'campaign':
                        var chart_width = 300;
                        var chart_height = 120;
                        var chart_margin =  [0, 0, 0, 0];
                        break;
                    case 'tactics':
                        var chart_width = 300;//
                        var chart_height = 120;
                        var chart_margin =  [0, 0, 0, 0];
                        break;
                    case 'strategy':
                        var chart_width = 300;
                        var chart_height = 130;
                        var chart_margin =  [0, 0, 0, 0];
                        break;         
                    default:
                      
                }
            for (var i = 0; i < lineDate.length; i++) {
                var chartDate = lineDate[i]['date'].split("-");
                data.push([
                    Date.UTC(parseInt(chartDate[0]), parseInt(chartDate[1], 10) - 1 , parseInt(chartDate[2])),
                    lineDate[i]['y'] 
                ]);
            }

            var dataLength = data.length;
            var timeInterval = dataLength/4;

            return {
                options: {
                  chart: {
                    width :chart_width,
                    height:chart_height
                  },
                credits: {
                    enabled: false
                },
                rangeSelector: {
                    selected: 1
                },
                tooltip: {
                    useHTML: false,
                    dateTimeLabelFormats: {
                        day: '%e of %b'
                    },
                    formatter: function () {
                      return '<div class="chart-tool-tip" >' + Highcharts.dateFormat('%A , %b %d , %Y', this.x) +  '<br/> ' +this.series.name +':' + '<b> '+this.y + '</b></div>';

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
                    tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
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
                    },
                    tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
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
                        if(chart !== undefined && chart.xAxis !== undefined){
//                            console.log(chart);
                          //  console.log(chart.xAxis);
                            var extremesX = chart.xAxis[0].getExtremes();
                            chart.xAxis[1].setExtremes(extremesX.min - 0.5 , extremesX.max + 0.5);
                            var extremes = chart.yAxis[0].getExtremes();
                            chart.yAxis[0].addPlotBand({ // Light air
                                from: threshold,
                                to: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? extremes.max : extremes.min,
                                color: '#fbdbd1',
                                label: {
                                    enabled: false,
                                    text: '',
                                    style: {
                                        color: 'red'
                                    }
                                }
                            });

                            //draw plotlines
                            chart.yAxis[0].addPlotLine({
                                value: extremes.max,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });
                            chart.xAxis[0].addPlotLine({
                                value: extremesX.max,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });
                            chart.xAxis[0].addPlotLine({
                                value: extremesX.min,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });

                        }
                    }, 500);
                },

                getLineData: function() {
                  return lineDate;
                }

            };
        };
        return {
            highChart: lineChart
        };
    });
}());