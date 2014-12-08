/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("pieChart", function($timeout) {

        var pieChart = function(graphData, colors) {
            var data = [], colors;

            for (var key in graphData) {
                data.push({'y':graphData[key],
                 'color':colors[key]});
            }

            return {
                options: {
                chart: {
                    renderTo: 'container',
                    width:100,
                    height:100,
                    type: 'pie',
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: ''
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false
                    },
                    series: {
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                },
                tooltip: {
                    enabled:false,
                    formatter: function() {
                        return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
                    }
                },
                legend:{
                    enabled: false
                },
                credits:{
                    enabled:false
                }
            },
                series: [{
                    data: data,
                    /*[ {
                y: 216.4,
                color: '#BF0B23'
            } ]*/
                    size: '125%',
                    innerSize: '80%',
                    showInLegend:false,
                    dataLabels: {
                        enabled: false
                    }
                }],
                loading: false,
                func: function(chart) {
                    $timeout(function() {
                        

                    }, 1000);
                }

            };
        };
        return {
            highChart: pieChart
        };
    });
}());