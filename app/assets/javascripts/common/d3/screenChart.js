(function () {
    "use strict";
    commonModule.service("screenChart", function ($rootScope, constants, screenChartModel) {

        var length = 250,
            icon_padding_xaxis = 50 ,
            icon_padding_yaxis = 12,
            w = 8,
            grey = "#DDE6EB";


        function updateScreenChartData() {
            var data = screenChartModel.getScreenWidgetData()['chartData'];
            this.screenData = data;
            d3.select("#screen_svg").remove();
            createScreenChart.call(this, this.screenData);
        };

        this.updateScreenChartData = updateScreenChartData;

        function dataFormatting(data) {

            var positions = [
                [70, 70],
                [70, 150],
                [70, 230],
                [70, 300]
            ];
            var formattedData = [];
            var selected_metric_text = screenChartModel.getScreenWidgetData()['selectedMetric'];
            var selected_metric_key;

            if (selected_metric_text == constants.SPEND)
                selected_metric_key = 'gross_rev';
            else if (selected_metric_text == constants.ACTION_RATE)
                selected_metric_key = 'action_rate';
            else
                selected_metric_key = selected_metric_text.toLowerCase();


            if (selected_metric_key == 'ctr' || selected_metric_key == 'vtc' || selected_metric_key == 'impressions'
                || selected_metric_key == 'action_rate' || selected_metric_key == 'action rate' || selected_metric_key == 'gross_rev') {

                data = _.chain(data)
                    .sortBy(function (d) {
                        return d[selected_metric_key];
                    })
                    .reverse()
                    .value();
            } else {
                data = _.chain(data)
                    .sortBy(function (d) {
                        return d[selected_metric_key];
                    })
                    .value();

            }


            if (data !== undefined && data.length > 0) {

                var max_selected_metric_value,
                    totalAllocation = 0,
                    ratio = 0 ,
                    index_to_remove = -1;

                for (var i in data) {
                    totalAllocation += data[i][selected_metric_key];

                    // fill index_to_remove if it has dimension as unkown
                    if (data[i].dimension.toLowerCase() == 'unknown') {
                        index_to_remove = i;
                    }
                }

                if(index_to_remove !== -1)
                  data.splice(index_to_remove,1);

                if (selected_metric_key == 'ctr' || selected_metric_key == 'vtc' || selected_metric_key == 'impressions'
                    || selected_metric_key == 'action_rate' || selected_metric_key == 'action rate' || selected_metric_key == 'gross_rev'){
                    // max selected metric value will be first non zero value of the selected metric out of all nodes
                     max_selected_metric_value = ((data[0][selected_metric_key]) == 0 ? ((data[1] !== undefined && data[1][selected_metric_key]) == 0 ? ((data[2] !== undefined && data[2][selected_metric_key] == 0 ? (data[3] !== undefined && data[3][selected_metric_key]):(data[2][selected_metric_key])) ):((data[1][selected_metric_key]) )) : ((data[0][selected_metric_key]))),
                     ratio = (max_selected_metric_value == 0)? 0 : length / max_selected_metric_value ;

                } else {
                    max_selected_metric_value =
                   ( ( data[2] !== undefined && data[2][selected_metric_key]) == 0 ? ((data[1] !== undefined && data[1][selected_metric_key]) == 0 ? (data[0] !== undefined ?  data[0][selected_metric_key] : 0 ): data[1][selected_metric_key] ): data[2][selected_metric_key] ) ;
                    ratio = (max_selected_metric_value == 0)? 0 : length / max_selected_metric_value ;

                }



                for (var index in data) {
                    var node = data[index];

                    var percAllocation , percAllocationString , showGreyProgressBar = false, bar_length;

                    if (selected_metric_key == 'gross_rev' || selected_metric_key == 'impressions') {
                        percAllocation = (totalAllocation == 0 || node[selected_metric_key] == 0)? 0: (node[selected_metric_key] / totalAllocation) *100;
                        if(percAllocation < 0.5)
                        percAllocation = 0.00;
                        bar_length = node[selected_metric_key] * ratio ;
                        percAllocationString = percAllocation.toFixed(0) + "%";

                    } else if (selected_metric_key == 'ctr' || selected_metric_key == 'action_rate' || selected_metric_key == 'vtc') {
                        percAllocation = node[selected_metric_key] * 100;
                        bar_length = node[selected_metric_key] * ratio ;
                        percAllocationString = percAllocation.toFixed(2) + "%";
                    } else if (selected_metric_key == 'cpa' || selected_metric_key == 'cpm' || selected_metric_key == 'cpc') {
                        bar_length = (node[selected_metric_key] == 0)? 0: (length * node[selected_metric_key] / max_selected_metric_value)  ;
                        percAllocation = node[selected_metric_key] ;
                        percAllocationString = "$" + percAllocation.toFixed(2);
                    }

                    if (percAllocation !== undefined && percAllocation.toFixed(2) == 0.00) {
                        showGreyProgressBar = true;
                    }

                    var iconPath;
                    switch (node.dimension) {
                        case 'Display':
                            iconPath = window.assets.display;
                            break;
                        case 'Video':
                            iconPath = window.assets.video;
                            break;
                        case 'Social':
                            iconPath = window.assets.social;
                            break;
                        case 'Mobile':
                            iconPath = window.assets.mobile;
                            break;
                        case 'Desktop':
                            iconPath = window.assets.desktop;
                            break;
                        case 'Smartphone' :
                            iconPath = window.assets.smartphone;
                            break;
                        case 'Tablet' :
                            iconPath = window.assets.tablet;
                            break;
                    }

                    var obj = {
                        dimension: node.dimension,
                        selected_metric: selected_metric_key,
                        selected_metric_value: node[selected_metric_key],
                        length: bar_length,
                        x: positions[index][0],
                        y: positions[index][1],
                        percValue: percAllocationString,
                        showGreyProgressBar: showGreyProgressBar,
                        iconPath: iconPath

                    };

                    formattedData.push(obj);
                }
            }
            return  formattedData;
        };

        function createScreenChart(data) {

            if (data !== undefined && data.total_brands == 1 && data['brands'][0].budget == 0) {
                $("#data_not_available").show();
            }

            d3.select("#screen_svg").remove();
            var screen_svg = d3.select("#screens").append("svg")
                .attr("width", 400)
                .attr("height", 280)
                .attr("id", "screen_svg")
                .append("g");

            var gradient = screen_svg.append("svg:defs")
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

            var widgetData = dataFormatting(data);


            var node = screen_svg.selectAll(".node")
                .data(widgetData)
                .enter()
                .append("g")
                .attr("class", "node");

            node.append("svg:image")
                .attr("x", function (d) {
                    return (d.x - icon_padding_xaxis);
                })
                .attr("y", function (d) {
                    return d.y - icon_padding_yaxis - 8;
                })
                .attr("width", 30)
                .attr("height", 30)
                .attr("xlink:href", function (d) {
                    return d.iconPath;
                });


            node.append("rect")
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("height", w)
                .style("visibility", function (d) {
                    return (d.showGreyProgressBar == true) ? "visible" : "hidden";
                })
                .attr("width", length)
                .attr("stroke", grey)
                .attr("fill", grey)
                .attr("stroke-width", '0.5px');

            node.append("rect")
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", function (d) {
                    return d.length;
                })
                .attr("height", 8)
                .attr("fill", "url(#gradient)")
                .attr("stroke-width", '0.5px')
                .style("visibility", function (d) {
                    return (d.showGreyProgressBar == true) ? "hidden" : "visible";
                });

            node.append("text")
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y - (2 * w);
                })
                .attr("font-family", "Avenir")
                .style("fill", "#57606d")
                .style("font-weight", "500")
                .style("font-size", "14px")
                .text(function (d) {
                    return d.dimension;
                });

            node.append("text")
                .attr("x", function (d) {
                    if(d.percValue.length < 4)
                    return 285;
                    else if(d.percValue.length < 7)
                        return 260;
                    else if(d.percValue.length < 12)
                    return 240 ;
                    else if (d.percValue.length < 16)
                    return 210;
                })
                .attr("y", function (d) {

                    return d.y - (2 * w);
                })
                .attr("font-family", "Avenir")
                .style("font-weight", "900")
                .style("fill", "#333")
                .style("font-size", "20px")
                .text(function (d) {
                    return d.percValue;
                });


        };

    });
}());

(function () {
    "use strict";
    commonModule.directive("screenChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_screen_chart
        }
    })
}());
