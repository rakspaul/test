define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('pieChart', function () {
        return {
            restrict: 'EA',

            controller: ['$scope', '$http', function() {
            }],

            link: function (scope, elem, attrs) {
                var drawPieChart = function(chartData) {
                    var config = JSON.parse(chartData),
                        radius = Math.min(config.width, config.height),
                        color = d3.scale.ordinal().range(config.colors), // jshint ignore:line
                        pie = d3.layout.pie().sort(null), // jshint ignore:line

                        arc = d3.svg.arc() // jshint ignore:line
                            .innerRadius(radius - 85)
                            .outerRadius(radius - 60),
                            svg = d3.select('#'+config.widgetId).append('svg') // jshint ignore:line
                            .attr('width', config.width)
                            .attr('height', config.height)
                            .append('g')
                            .attr('transform', 'translate(' + config.width / 2 + ',' + config.height / 2 + ')'),

                        path = svg.selectAll('path') // jshint ignore:line
                            .data(pie(config.data))
                            .enter().append('path')
                            .attr('fill', function(d, i) { return color(i); })
                            .attr('d', arc);
                };

                drawPieChart(attrs.chartData);
            }
        };
    });
});