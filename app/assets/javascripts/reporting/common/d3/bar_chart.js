(function () {
    'use strict';
    angObj.directive('barChart', function ($window) {
        return {
            restrict: 'EA',
            templateUrl: assets.html_bar_chart,

            controller: ['$scope', '$http', function($scope, $http) {
            }],
            link: function (scope, elem, attrs, ctrl) {

                var drawBarChart = function(chartData) {
                    scope.barData = chartData;
                    scope.separator = chartData.separator || ':'
                    scope.kpiType = chartData.kpiType;
                    scope.page = chartData.page;

                    var barChatPlotData = _.pluck(chartData.data, 'value');

                    barChatPlotData = _.filter(barChatPlotData, function(obj) { return obj !== 'NaN' });
                    if(barChatPlotData.length > 0) {
                        scope.total = _.reduce(barChatPlotData, function (sum, num) {
                            return sum + num;
                        }, 0);
                        if (chartData.showLabel && chartData.data && chartData.data.length < 3) {
                            scope.disableLabel = {'visibility': 'hidden'};
                        }

                        var widgetElem = elem.find(".barChartWidget");
                        var containerWidthScreen = elem.parent().width() - 25 ,
                            chartScreen,
                            widthScreen = containerWidthScreen - (chartData.widthToSubtract || 28),
                            bar_heightScreen = chartData.barHeight || 4,
                            gapScreen = chartData.gapScreen || 33,
                            heightScreen = bar_heightScreen + 50;


                        var xScreen, yScreen;
                        xScreen = d3.scale.linear()
                            .domain([0, d3.max(barChatPlotData)])
                            .range([0, widthScreen]);

                        yScreen = function (iScreen) {
                            return bar_heightScreen * iScreen;
                        }
                        chartScreen = d3.select(widgetElem[0])
                            .append('svg')
                            .attr('class', 'chart')
                            .attr('width', widthScreen )
                            .attr('height', 200);

                        var gradient = chartScreen.append("svg:defs")
                            .append("svg:linearGradient")
                            .attr("id", "gradient")
                            .attr("x1", "0%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "0%")
                            .attr("spreadMethod", "pad");

                        gradient.append("svg:stop")
                            .attr("offset", "50%")
                            .attr("stop-color", "#0978c9")
                            .attr("stop-opacity", 1);

                        gradient.append("svg:stop")
                            .attr("offset", "80%")
                            .attr("stop-color", "#2298ef")
                            .attr("stop-opacity", 1);

                        chartScreen.selectAll("rect")
                            .data(barChatPlotData)
                            .enter().append("rect")
                            .attr("rx", 4)
                            .attr("ry", 4)
                            .attr("x", 0)
                            .attr("fill", "url(#gradient)")
                            .attr("stroke-width", '0.5px')
                            .attr("y", function (dScreen, iScreen) {
                                return iScreen * gapScreen;
                            })
                            .attr("width", xScreen)
                            .attr("height", bar_heightScreen);

                        widgetElem.find('rect').each(function () {
                            var value = parseFloat($(this).attr('width'));
                            if (value == 0) {
                                $(this).attr({width: widthScreen, style: "fill:#dddddd"});
                            }
                        });
                    } else {
                        scope.barData.data = [];
                    }
                }

                if(attrs.class == 'DashBoradScreenWidget') {
                    scope.$watch('screenData', function (data) {
                        drawBarChart(data)
                    });
                } else {
                    drawBarChart(JSON.parse(attrs.chartData))
                }
            }

        }
    });
}());