define(['angularAMD'
],function (angularAMD) {
    "use strict";
    angularAMD.factory("solidGaugeChart", function($timeout) {
        var solidGaugeChart = function(viewabilityData) {
        //for testing -mock data
        //var viewabilityData = {pct_1s: 25.876533630764754, pct_5s: 16.308617428834683, pct_15s: 8.534988603850444, pct_total: 42.78647980214345, total: 8823}
           return {
                options: {
                    chart: {
                        renderTo: 'section_graph',
                        type: 'solidgauge',
                        height:100,
                        width:100,
                        spacingTop: 0,
                        spacingRight: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        plotBorderWidth: 0,
                        marginRight: 0, //-60, //this does move the chart but you'll need to recompute it
                        marginLeft: 0, //-60,  //whenever the page changes width
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
                        enabled:false,
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
                        tickInterval: viewabilityData.pct_total, //supply value from API
                        tickPositions: [viewabilityData.pct_total], //from api 67%
                        tickColor: '#000000',
                        tickPosition: 'outside',
                        tickLength: 4,
                        tickWidth: 1
                    }
                },
                 series: viewabilityData.highChartSeriesObj,
                loading: false,
                func: function(chart) {
                    //orange, green, blue, black
                    // var colors= ['#FFA700', '#45CB41', '#008ED5', '#000000'];
                    // $(window).resize(function () {
                    //     //resize rendering issue fix for future - cost viewability
                    //     reRender();
                    // });
                    // $timeout(function() {
                    //     reRender();       
                    // }, 1000);
                    // function reRender(){
                    //     $('#costViewability .highcharts-tracker path').each(function(index, value) { 
                    //         $(value).attr({fill:colors[index]});
                    //     });

                    // }
                }
            };
        };
        return {
            highChart: solidGaugeChart
        };
    });
});
