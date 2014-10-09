/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("actionChart", function($timeout) {
        var lineChart = function() {
            return {
                options: {
                    chart: {
                        width: 500,
                        height: 330,
                        margin: [40, 0, 30, 60]
                    },
                    title: {
                        text: '',
                        style: {
                            "color": "#ffffff"
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions : {
                        line : {
                            dataLabels : {
                                enabled : true,
                                y: -10,
                                formatter : function() {
                                    return '$'+this.y;
                                }
                            }
                        },
                        series: {
                            cursor: 'pointer',
                            point: {
                                events: {
                                    click: function () {
                                        if(this.note.id){
                                            $('#actionItem_'+this.note.id).siblings().removeClass('action_selected').end().addClass('action_selected');     
                                            //$('.campaign-performance-match').scrollTop($('#actionItem_'+this.note.id).top); 
                                            $('#action-container:first').animate({scrollTop: $('#actionItem_'+this.note.id).offset().top}, 1000);                                  
                                        }
                                    }
                                }
                            }
                        }
                    },
                    yAxis: {
                        maxPadding:0,
                        minPadding:0,
                        title: {
                            align: 'high',
                            offset: 13,
                            text: 'CPA',
                            rotation: 0,
                            y: -20
                        },
                        lineWidth: 1,
                        tickWidth: 0,
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        labels: {
                            formatter: function() {
                                return '$' + this.value;
                            }
                        }
                    },
                    xAxis: {
                        maxPadding:0,
                        minPadding:0,
                        tickWidth: 0,
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    },
                    tooltip: {
                        crosshairs: [{
                            dashStyle: 'dash'
                        },
                        {
                            dashStyle: 'dash'
                        }],
                        enabled: false
                    },
                },
                series: [{

                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    name: 'CPA',
                    data: [29.9, {
                            marker: {
                                enabled: true,
                                fillColor: '#FFFFFF',
                                lineWidth: 4,
                                lineColor: "orange", // inherit from series
                                radius: 7,
                                borderRadius: 2

                            },
                            y: 71.5,
                            note: {
                                text: 'Optimised geo to include the whole area',
                                id: '0'
                            }
                        }, {
                            marker: {
                                enabled: true,
                                fillColor: '#FFFFFF',
                                lineWidth: 4,
                                lineColor: "#90ED7D", // inherit from series
                                radius: 7,
                                borderRadius: 2

                            },
                            y: 81.5,
                            note: {
                                text: 'The new creatives are in!',                                
                                id: '0'
                            }
                        },
                        106.4,
                        129.2,
                        144.0,
                        176.0, {
                            marker: {
                                enabled: true,
                                fillColor: '#FFFFFF',
                                lineWidth: 4,
                                lineColor: "#1786FF", // inherit from series
                                radius: 7,
                                borderRadius: 2
                            },
                            y: 148.6,
                            note: {
                                text: 'Client signed!',
                                id: '0'
                            }
                        },
                        {
                            marker: {
                                enabled: true,
                                fillColor: '#FFFFFF',
                                lineWidth: 4,
                                lineColor: "#1786FF", // inherit from series
                                radius: 7,
                                borderRadius: 2
                            },
                            y: 148.6,
                            note: {
                                text: 'Client signed!',
                                id: '0'
                            }
                        },
                        178.5,
                        216.4,
                        {
                            marker: {
                                enabled: true,
                                fillColor: '#FFFFFF',
                                lineWidth: 4,
                                lineColor: "#1786FF", // inherit from series
                                radius: 7,
                                borderRadius: 2
                            },
                            y: 148.6,
                            note: {
                                text: 'Client signed!',
                                id: '0'
                            }
                        },
                        95.6,
                        54.4
                    ],
                    color: "#90ED7D"
                }],
                loading: false,
                func: function(chart) {
                    var kpiType = "CPA";
                    var threshold = 100;
                    chart.renderer.image('/assets/cdesk/icn_goal.png', 0, 185, 17, 17).add();      
                    chart.yAxis[0].addPlotBand({ // Light air
                        from: threshold,
                        to: chart.yAxis[0].chart.plotSizeY,
                        //(kpiType == 'CPC' || kpiType == 'CPA' || kpiType == 'CPM') ? extremes.max : extremes.min,
                        color: '#fbdbd1',
                        label: {
                            enabled: false,
                            text: '',
                            style: {
                                color: 'red'
                            }
                        }
                    });
                }
            }
        };
        return {
            lineChart: lineChart
        };
    });
}());