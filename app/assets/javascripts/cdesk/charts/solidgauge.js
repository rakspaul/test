/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("solidGaugeChart", function($timeout) {

        var solidGaugeChart = function(viewabilityData) {

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
                        marginTop: 0,
                        marginBottom: 0
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
                        size: '88%',
                        startAngle: 0,
                        endAngle: 360,

                        background: {
                            
                            outerRadius: '101%',
                            backgroundColor: '#ffffff',
                        }
                    },
                    plotOptions: {
                        solidgauge: {
                            dataLabels: {
                                enabled: false,
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
                        tickWidth: 1,

                    },

                },
                 series: [{
                    innerRadius: '70%',
                    data: [{y:viewabilityData.pct_15s, color:'red'}],
                    radius: '55%'
                }, {
                    innerRadius: '85%',
                    data: [{y:viewabilityData.pct_5s, color:'orange'}],
                    radius: '70%'
                }, {
                    innerRadius: '100%',
                    radius: '85%',
                    data: [{y:viewabilityData.pct_1s, color:'green'}],
                }, {
                    innerRadius: '101',
                    data: [{y:viewabilityData.pct_total, color:'black'}]
                }],
                loading: false,
                func: function(chart) {
                    var colors= ['green', 'orange', 'red', 'black'];
                    $(window).resize(function () {
                        //resize rendering issue fix for future - cost viewability
                        reRender();
                    });

                    $timeout(function() {
                        reRender();       
                    }, 1000);

                    function reRender(){
                        $('#costViewability .highcharts-tracker path').each(function(index, value) { 
                            $(value).attr({fill:colors[index]});
                        });

                    }
                }

            };
        };
        return {
            highChart: solidGaugeChart
        };
    });
}());