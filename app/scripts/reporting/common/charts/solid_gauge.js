define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.factory('solidGaugeChart', function () {
        var solidGaugeChart = function (viewabilityData) {
            return {
                options: {
                    chart: {
                        renderTo: 'section_graph',
                        type: 'solidgauge',
                        height: 100,
                        width: 100,
                        spacingTop: 0,
                        spacingRight: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        plotBorderWidth: 0,

                        // this does move the chart but you'll need to recompute it
                        marginRight: 0,

                        // whenever the page changes width
                        marginLeft: 0,

                        marginTop: 3,
                        marginBottom: 0,

                        animation: {
                            duration: 100,
                            easing: 'easeOutBounce'
                        }
                    },

                    tooltip: {
                        enabled: false
                    },

                    title: {
                        enabled: false,
                        text: ''
                    },

                    credits: {
                        enabled: false
                    },

                    pane: {
                        size: '97%',
                        startAngle: 0,
                        endAngle: 360,

                        background: {
                            outerRadius: '101%',
                            backgroundColor: '#ffffff'
                        }
                    },

                    plotOptions: {
                        animation: true,

                        solidgauge: {
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },

                    yAxis: {
                        labels: {
                            enabled: false
                        },

                        min: 0,
                        max: 100,
                        gridLineColor: 'transparent',
                        lineColor: 'transparent',
                        minorTickLength: 0,

                        //supply value from API
                        tickInterval: viewabilityData.pct_total,

                        //from api 67%
                        tickPositions: [viewabilityData.pct_total],
                        tickColor: '#000000',
                        tickPosition: 'outside',
                        tickLength: 4,
                        tickWidth: 1
                    }
                },

                series: viewabilityData.highChartSeriesObj,
                loading: false,

                func: function () {}
            };
        };

        return {
            highChart: solidGaugeChart
        };
    });
});
