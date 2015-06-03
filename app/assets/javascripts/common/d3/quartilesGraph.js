(function () {
    'use strict';
    angObj.directive('quartilesGraph', function (utils,constants) {
        return {
            restrict: 'EA',
            template: "<svg></svg>",
            link: function(scope, elem, attrs) {
                var chartData = JSON.parse(attrs.chartData);
                var vtcMapper =  {'vtc_25_perc': 25, 'vtc_50_perc' : 50, 'vtc_75_perc' : 75, 'vtc_rate' : 100};
                var vtcDataToPlot = [];

                var vtcRoundOff =  function(input, places) {
                    places = input >1 ? 0 : places;
                    var factor = Math.pow(10, places);
                    return Math.round(input * factor) / factor;
                }
                _.each(chartData, function(value, key) {
                    if(vtcMapper[key]) {
                        vtcDataToPlot.push({'vtc' : vtcMapper[key], 'values' : vtcRoundOff(value, 2) })
                    }
                });
                vtcDataToPlot.push({'vtc' : 0, 'values' :100});
                vtcDataToPlot = _.sortBy(vtcDataToPlot , 'vtc')
                var margin = { top : 20, right: 20, left: 20, bottom: 20};
                var rawSvg = elem.find('svg');
                rawSvg.attr("width", attrs.width);
                rawSvg.attr("height", attrs.height);
                var width = rawSvg.attr("width") - margin.left - margin.right;
                var height = rawSvg.attr("height") - margin.bottom - margin.top;
                var svg = d3.select(rawSvg[0]);
                var xScale, yScale, xAxisGen, yAxisGen, lineFun, area;

                function setChartParameters() {
                    xScale = d3.scale.linear().domain([vtcDataToPlot[0].vtc, vtcDataToPlot[vtcDataToPlot.length - 1].vtc]).range([20, width]);
                    yScale = d3.scale.linear().domain([0, d3.max(vtcDataToPlot, function(d) {
                        return d.values;
                    })]).range([height, 20]);

                    xAxisGen = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .tickValues([0, 25, 50, 75, 100])
                        .tickFormat(function(d){
                            return d ==0 ? d : (d +'%');
                        });

                    yAxisGen = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .tickValues(1);

                    //define area
                    area = d3.svg.area()
                        .x(function(d) {
                            return xScale(d.vtc);
                        })
                        .y0(height)
                        .y1(function(d) {
                            return yScale(d.values);
                        });

                    lineFun = d3.svg.line()
                        .x(function(d) {
                            return xScale(d.vtc);
                        })
                        .y(function(d) {
                            return yScale(d.values);
                        })

                }

                function drawLineChart() {
                    setChartParameters();
                    //add grid lines

                    svg.append("svg:g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxisGen);

                    svg.append("svg:g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(20,0)")
                        .call(yAxisGen);

                    //draw the area now
                    svg.append("path")
                        .datum(vtcDataToPlot)
                        .attr("class", "area")
                        .attr("d", area);

                    svg.append("svg:path")
                        .attr({
                            d: lineFun(vtcDataToPlot),
                            "stroke": "#0978c9",
                            "stroke-width": 2,
                            "fill": "none",
                        });

                    svg.selectAll("line.verticalGrid").data(vtcDataToPlot).enter()
                        .append("line")
                        .attr({
                            "y1": height,
                            "y2": margin.top,
                            "x1": function(d) {
                                return xScale(d.vtc);
                            },
                            "x2": function(d) {
                                return xScale(d.vtc);
                            },
                            "stroke": "#dde6eb",
                            "stroke-width": "1px"
                        }).style("stroke-dasharray", ("3, 3"));

                    //plotting circles on chart

                    var circles = svg.selectAll("circle")
                        .data(vtcDataToPlot)
                        .enter().append("circle")
                        .attr({
                            "class": "dots",
                            "r": 5,
                            "cx": function(d) {
                                return xScale(d.vtc);
                            },
                            "cy": function(d) {
                                return yScale(d.values);
                            }
                        })

                    //plotting lables on chart
                    var label = svg.selectAll(".labels")
                        .data(vtcDataToPlot)
                        .enter().append("text")
                        .attr("class", "labels")
                        .attr("x", function(d) {
                            return xScale(d.vtc) - 10;
                        })
                        .attr("y", function(d) {
                            return yScale(d.values) - 10;
                        })
                        .text(function(d) {
                            return d.values + '%'
                        })
                }
                drawLineChart();

            }
        };
    })
}());