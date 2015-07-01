(function () {
    'use strict';
    angObj.directive('barChart', function ($window) {
        return {
            restrict: 'EA',
            templateUrl: '/assets/html/partials/bar_chart.html',

            controller: ['$scope', '$http', function($scope, $http) {
            }],
            link: function (scope, elem, attrs, ctrl) {
                var chartData = JSON.parse(attrs.chartData);

                var values = _.compact(_.pluck(chartData.data, 'value'));
                scope.total = _.reduce(values, function(sum, num){ return sum + num; }, 0);
                if(chartData.showLabel && chartData.data && chartData.data.length < 3) {
                    scope.disableLabel = {'visibility': 'hidden'};
                }
                scope.barData = chartData;

                var widgetName = scope.barData.widgetName.toLowerCase();
                var widgetElem = elem.find(".barChartWidget");
                var containerWidthScreen = elem.parent().width();
                var barChatPlotData =  _.pluck(chartData.data, 'value'),
                    chartScreen,
                    widthScreen = containerWidthScreen - 28,
                    bar_heightScreen = 4,
                    gapScreen = 0,
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
                    .attr('width', widthScreen)
                    .attr('height', 200);

                chartScreen.selectAll("rect")
                    .data(barChatPlotData)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", function (dScreen, iScreen) {
                        return iScreen * 33;
                    })
                    .attr("width", xScreen)
                    .attr("height", bar_heightScreen);

                widgetElem.find('rect').each(function() {
                    var value = parseFloat($(this).attr('width'));
                    if (value == 0) {
                        $(this).attr({ width: widthScreen,style: "fill:#dddddd"});
                    }
                });
                // d3 Ends Here
            }

        }
    });
}());