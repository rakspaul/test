/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("actionChart", function($timeout) {
        var lineChart = function() {
            return {
                options: {
                    chart: {
                        width: 500,
                        height: 330
                    },
                    title: {
                        text: 'yo',
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
                    yAxis: {

                        title: {
                            align: 'high',
                            offset: 13,
                            text: 'CPA',
                            rotation: 0,
                            y: -10
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
                        tickWidth: 0,
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    },
                    tooltip: {
                        crosshairs: true,

                        formatter: function() {
                            console.log(this);
                            if (typeof(this.point.options.note) === 'undefined') {
                                return this.series.name + ':' + ' <b> $' + this.point.y + '</b><br/>';
                            } else {
                                return this.series.name + ':' + ' <b> $' + this.point.y + '<br>' + this.point.options.note.text + '</b><br/>';
                            }


                        }
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
                                text: 'Optimised geo to include the whole area'
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
                                text: 'The new creatives are in!'
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
                                text: 'Client signed!'
                            }
                        },
                        178.5,
                        216.4,
                        95.6,
                        54.4
                    ],
                    color: "#90ED7D"
                }],
                loading: false,
                func: function(chart) {
                }
            }
        };
        return {
            lineChart: lineChart
        };
    });
}());