/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("columnline", function($timeout) {

        var columnChart = function(lineDate, threshold, kpiType) {
            var data = [],
                datObj = [];


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
                    categories: ['iab-tech', 'iab-movies', 'iab-sports', 'iab-vtech', 'iab-dadatech', 'iab-whoknows',
                        'iab-whatever', 'iab-iamtired', 'iab-cool', 'iab-music', 'iab-karaoke', 'iab-rap'],
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    tickWidth: 0,
                    labels:{
                        enabled:false
                    }
                }
                  ],

                yAxis: [{ // Primary yAxis
                    labels: {
                        enabled:false,
                        format: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }, { // Secondary yAxis
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        enabled:false,
                        format: '{value} mm',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                }],
                series: [{
                    name: '',
                    type: 'column',
                    yAxis: 1,
                    data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                    tooltip: {
                        valueSuffix: ' mm'
                    }

                }, {
                    name: '',
                    type: 'line',
                    data: [2332, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                    tooltip: {
                        valueSuffix: '°C'
                    }
                }],
                loading: false,
                func: function(chart) {
                    //
                }

            };
         /*   return  {
                chart: {
                    width: 295,
                    height: 240
                },
                title: {
                    text: ' '
                },
                subtitle: {
                    text: ' '
                },
                xAxis: [{
                    enabled:false,
                    categories: ['iab-tech', 'iab-movies', 'iab-sports', 'iab-vtech', 'iab-dadatech', 'iab-whoknows',
                        'iab-whatever', 'iab-iamtired', 'iab-cool', 'iab-music', 'iab-karaoke', 'iab-rap']
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }, { // Secondary yAxis
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        enabled:false,
                        format: '{value} mm',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 120,
                    verticalAlign: 'top',
                    y: 100,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: '',
                    type: 'column',
                    yAxis: 1,
                    data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                    tooltip: {
                        valueSuffix: ' mm'
                    }

                }, {
                    name: '',
                    type: 'line',
                    data: [2332, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                    tooltip: {
                        valueSuffix: '°C'
                    }
                }]
            };*/
        };
        return {
            highChart: columnChart
        };
    });
}());