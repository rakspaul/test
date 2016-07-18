// global angObj, angular
define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.factory('line', function ($timeout) {
        var findKey = function (obj, value) {
           var key;

           _.each(obj, function (v, k) {
               if (v === value) {
                   key = k;
               }
           });

           // if value exists return the corresponding Key else return value
           return (key !== undefined ? key.toUpperCase() : value.toUpperCase());
        };

        var lineChart = function (lineDate, threshold, kpiType,chartFrom) {
            var chartWidth,
                chartHeight,
                chartMargin,
                data = [],
                i,
                chartDate,
                dataLength,
                timeInterval,

                kpiMap = {
                        cpc: 'gross_ecpc',
                        cpa: 'gross_ecpa',
                        cpm: 'gross_ecpm'
                    };

            kpiType = kpiType !== 'null' ? kpiType : 'NA';

            if (chartFrom === 'tactics') {
               kpiType =  findKey(kpiMap,kpiType);
            }

            switch(chartFrom) {
                case 'campaign':
                    chartWidth = 330;
                    chartHeight = 106;
                    chartMargin =  [0, 0, 0, 0];
                    break;

                case 'tactics':
                    chartWidth = 330;
                    chartHeight = 106;
                    chartMargin =  [0, 0, 0, 0];
                    break;

                case 'strategy':
                    chartWidth = 330;
                    chartHeight = 106;
                    chartMargin =  [0, 0, 0, 0];
                    break;
            }

            for (i = 0; i < lineDate.length; i++) {
                chartDate = lineDate[i].date.split('-');

                data.push([
                    Date.UTC(parseInt(chartDate[0]), parseInt(chartDate[1], 10) - 1 , parseInt(chartDate[2])),
                    lineDate[i].y
                ]);
            }

            dataLength = data.length;
            timeInterval = dataLength/4;

            return {
                options: {
                    chart: {
                        width :chartWidth,
                        height:chartHeight,
                        maginLeft:2,
                        spacingLeft: 14
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
                            return '<div class="chart-tool-tip" >' +
                                Highcharts.dateFormat('%A, %b %d, %Y', this.x) + // jshint ignore:line
                                '<br/> ' +this.series.name +':' + '<b> '+this.y + '</b></div>';
                        }
                    },

                    title: {
                        text: null
                    },

                    legend: {
                        enabled: false
                    },

                    xAxis: [
                        {
                            maxPadding:0,
                            minPadding:0,
                            tickWidth: 0,
                            type: 'datetime',

                            labels: {
                                style: {'color':'#939eaf','fontSize':11},

                                formatter: function () {
                                    return Highcharts.dateFormat('%e %b', this.value); // jshint ignore:line
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
                                formatter: function () {}
                            },

                            tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
                        }
                    ],

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

                        // TODO - remove this after the date ticks are rewritten
                        // plotBands: [{ // Light air
                        //     color: '#fff',//fbdbd1
                        //     label: {
                        //         enabled: false,
                        //         text: '',
                        //         style: {
                        //             color: 'red'
                        //         }
                        //     }
                        // }],

                        // threshold line ******
                        plotLines: [
                            {
                                label: {
                                    enabled: false,
                                    text: '',
                                    x: 25
                                },

                                color: '#D2DEE7',
                                width: 2,
                                value: threshold,
                                dashStyle: 'solid'
                            }
                        ]
                        // threshold line ends ******
                    }
                },

                series: [{
                    name: kpiType,
                    data: data,
                    threshold: threshold,

                    negativeColor: (kpiType.toLowerCase() === 'cpc' ||
                        kpiType.toLowerCase() === 'cpa' ||
                        kpiType.toLowerCase() === 'cpm') ? '#0078cc' : '#f24444',

                    color: (kpiType.toLowerCase() === 'cpc' ||
                        kpiType.toLowerCase() === 'cpa' ||
                        kpiType.toLowerCase() === 'cpm') ? '#f24444' : '#0078cc',

                    lineWidth: 2,

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

                func: function (chart) {
                    $timeout(function () {
                        var extremesX,
                            extremes;

                        if (chart !== undefined && chart.xAxis !== undefined) {
                            extremesX = chart.xAxis[0].getExtremes();
                            chart.xAxis[1].setExtremes(extremesX.min - 0.5 , extremesX.max + 0.5);
                            extremes = chart.yAxis[0].getExtremes();

                            // Light air
                            chart
                                .yAxis[0]
                                .addPlotBand({
                                    from: threshold,

                                    to: (kpiType.toLowerCase() === 'cpc' ||
                                        kpiType.toLowerCase() === 'cpa' ||
                                        kpiType.toLowerCase() === 'cpm') ? extremes.max : extremes.min,

                                    color: '#fff',

                                    label: {
                                        enabled: false,
                                        text: '',

                                        style: {
                                            color: 'red'
                                        }
                                    }
                                });

                            // draw plotlines
                            chart
                                .yAxis[0]
                                .addPlotLine({
                                    value: extremes.max,
                                    color: '#D2DEE7',
                                    width: 1,
                                    id: 'plot-line-1'
                                });

                            chart
                                .xAxis[0]
                                .addPlotLine({
                                    value: extremesX.max,
                                    color: '#D2DEE7',
                                    width: 1,
                                    id: 'plot-line-1'
                                });

                            chart
                                .xAxis[0]
                                .addPlotLine({
                                    value: extremesX.min,
                                    color: '#D2DEE7',
                                    width: 1,
                                    id: 'plot-line-1'
                                });

                            if ((threshold > 0 && threshold <= chart.yAxis[0].max &&
                                threshold >= chart.yAxis[0].min) &&
                                threshold > 0)  {
                                chart.renderer.image(assets.target_marker, 0,
                                    chart.yAxis[0].toPixels(threshold) - chart.plotTop / 2, 11, 11).add();
                            }
                        }
                    }, 500);
                },

                getLineData: function () {
                  return lineDate;
                }
            };
        };

        return {
            highChart: lineChart
        };
    });
});
