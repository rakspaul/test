(function() {
    'use strict';
    angObj.directive('campaignChart', function($window) {
        return {
            restrict: 'EA',
            template: "<svg></svg>",
            link: function(scope, elem, attrs) {
                var lineChartService = {
                    lineChartConfig: {},

                    createVariablesToDrawGraph: function(data, index) {
                        var _config = this.lineChartConfig;
                        var xkeyVal = _config.keys.xAxis.val;
                        var ykeyVal = _config.keys.yAxis.val;
                        var margin = _config.margin;
                        var width = _config.width;
                        var height = _config.height;


                        var xScale = d3.time.scale().domain([data[0][xkeyVal], data[data.length - 1][xkeyVal]]).range([margin.left, width]);
                        var yScale = d3.scale.linear().domain([0, d3.max(data, function(d) {
                            return d[ykeyVal];
                        })]).range([height, margin.left]);

                        var xAxisGen = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(_config.keys.xAxis.ticks)
                            .tickFormat(d3.time.format("%d %b"))
                            .tickSize(0);

                        //.tickValues(_config.keys.xAxis.tickValues)
                        /*.tickFormat(function(d){
                            return d ==0 ? d : (d +'%');
                        });*/

                        var yAxisGen = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .tickValues(_config.keys.yAxis.tickValues.length > 0 ? _config.keys.yAxis.tickValues : 1)
                            .tickSize(0);

                        // var parseDate = d3.time.format("%Y-%m-%d").parse;
                        //yScale.domain([0, 650]);  //rescale based on kpi

                        //define area
                        //if area is enabled
                        /* var area = d3.svg.area()
                             .x(function(d) {
                                 return xScale(d[xkeyVal]);
                             })
                             .y0(height)
                             .y1(function(d) {
                                 return yScale(d[ykeyVal]);
                             });*/

                        //draw a ling function
                        var lineFun = d3.svg.line()
                            .x(function(d) {
                                return xScale(d[xkeyVal]);
                            })
                            .y(function(d) {
                                return yScale(d[ykeyVal]);
                            })

                        this.updateConfig({
                            'xScale': xScale,
                            'yScale': yScale,
                            'xAxisGen': xAxisGen,
                            'yAxisGen': yAxisGen,
                            //'area' :area,
                            'lineFun': lineFun,

                        })
                    },

                    drawPath: function(data, index) {
                        // parse the dates from a string into a date object
                        var _config = this.lineChartConfig;
                        var xkeyVal = _config.keys.xAxis.val;
                        var ykeyVal = _config.keys.yAxis.val;
                        var threshold = _config.threshold;
                        var kpiType = _config.kpiType;
                        var svg = d3.select(_config.rawSvg[0]).append('g').attr("transform", "translate(10,0)");

                        //draw the area now
                        /*if(index === 0) {
                          svg.append("path")
                              .datum(data)
                              .attr("class", "area")
                              .attr("d", _config.area);
                        }*/
                        //lines for the border of the chart
                        svg.append("line")
                            .style("stroke-width", "1")
                            .style("stroke", "#C0D0E0")
                            .attr("id", "threshold-line")
                            .attr("x1", _config.margin.left).attr("y1", _config.margin.top)
                            .attr("x2", _config.width).attr("y2", _config.margin.top);

                        svg.append("line")
                            .style("stroke-width", "1")
                            .style("stroke", "#C0D0E0")
                            .attr("id", "threshold-line")
                            .attr("x1", _config.width).attr("y1", _config.height)
                            .attr("x2", _config.width).attr("y2", _config.margin.top);

                        if (threshold != 0) {
                            //if there is a threshold, then draw goal icon, line and render threshold encoding

                            //find the max data
                            var maxData = d3.max(data, function(d) {
                                return d[ykeyVal];
                            });

                            //if threshold is out of view i.e greater than data view
                            if (threshold > maxData) {
                                //rescale yaxis
                                _config.yScale.domain([0, threshold]);
                            }

                            svg.append("image")
                                .attr("id", "goal")
                                .attr("width", "11")
                                .attr("height", "11")
                                .attr("x", 5)
                                .attr("y", _config.yScale(threshold) - 5)
                                .attr("xlink:href", "/" + assets.target_marker);

                            svg.append("line")
                                .style("stroke-width", "2")
                                .style("stroke", "#C0D0E0")
                                .attr("id", "threshold-line")
                                .attr("x1", _config.margin.left).attr("y1", _config.yScale(threshold))
                                .attr("x2", _config.width).attr("y2", _config.yScale(threshold));

                            // svg.append("svg:path")
                            //     //.attr('stroke', 'url(#temperature-gradient)')
                            //     .attr({
                            //         d: _config.lineFun(data),
                            //         "class": "path" + index
                            //     });

                            //draw threshold
                            //TODO: older method of encoding threshold - verification process.
                            // svg.append("linearGradient")
                            //     .attr("id", "temperature-gradient")
                            //     .attr("gradientUnits", "userSpaceOnUse")
                            //     .attr("x1", 0).attr("y1", _config.yScale(threshold))
                            //     .attr("x2", 0).attr("y2", _config.yScale(threshold +0.01))
                            //     .selectAll("stop")
                            //     .data([{
                            //             offset: "0%",
                            //             color: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#f24444' : '#0078cc'
                            //         }, {
                            //             offset: "50%",
                            //             color: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#f24444' : '#0078cc'
                            //         }, //negative
                            //         {
                            //             offset: "50%",
                            //             color:  (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#0078cc' : '#f24444'
                            //         }, {
                            //             offset: "100%",
                            //             color: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#0078cc' : '#f24444'
                            //         }
                            //     ])
                            //     .enter().append("stop")
                            //     .attr("offset", function(d) {
                            //         return d.offset;
                            //     })
                            //     .attr("stop-color", function(d) {
                            //         return d.color;
                            //     });

                            //interpolate path data
                            var line = d3.svg.line()
                                .interpolate("basis")
                                .x(function(d) {
                                    return _config.xScale(d.date);
                                })
                                .y(function(d) {
                                    return _config.yScale(d.values);
                                });

                            //classes used to color the threshold clipping path
                            var red = "clip-above",
                                blue = "clip-below",
                                //default settings - positive color is blue and is below and danger zone is red that is above
                                aboveClass = blue,
                                belowClass = red;
                            if (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') {
                                //positive color is blue that is above and danger zone is below that is red
                                aboveClass = red,
                                belowClass = blue;
                            }

                            //clipPath area for threshold encoding
                            svg.append("clipPath")
                                .attr("id", aboveClass)
                                .append("rect")
                                .attr("width", _config.width)
                                .attr("height", _config.yScale(threshold));

                            svg.append("clipPath")
                                .attr("id", belowClass)
                                .append("rect")
                                .attr("y", _config.yScale(threshold))
                                .attr("width", _config.width)
                                .attr("height", _config.height - _config.yScale(threshold));

                            //apply threshold encoding color classes to the path data
                              svg.selectAll(".line")
                                .data(["above", "below"])
                                .enter().append("path")
                                .attr("class", function(d) { return "line " + d; })
                                .attr("clip-path", function(d) { return "url(#clip-" + d + ")"; })
                                .datum(data)
                                .attr("d", line)
                                .on("mouseover", tooltipMouseOver)
                                .on("mouseout", tooltipMouseOut);

                        } else { //if no threshold
                            //render default color to the path
                            svg.append("svg:path")
                                .attr({
                                    d: _config.lineFun(data),
                                    "class": "path" + index
                                })
                                .on("mouseover", tooltipMouseOver)
                                .on("mouseout", tooltipMouseOut);
                        }

                        //tooltipMouseOver
                        function tooltipMouseOver() {
                            var svg = d3.select(_config.rawSvg[0]),
                                mousePos = d3.mouse(this),
                                yAxisValue = _config.yScale.invert(mousePos[1]),
                                xAxisValue = _config.xScale.invert(mousePos[0]),
                                formatY = parseFloat(yAxisValue).toFixed(3),
                                formatX = moment(xAxisValue).format('dddd, D MMM, YYYY');// //Saturday, 24 Jan, 2015

                            var rect = svg.selectAll(".tooltip_box")
                                .data([mousePos]).enter()
                                .append("rect")
                                .attr("class","tooltip_box")
                                .attr("x", function(d) { return d[0] - 10})
                                .attr("y", function(d) { return d[1] - 15})
                                .attr("width", 140)
                                .attr("height", 40);
                            var text = svg.selectAll(".tooltip_line")
                                .data([mousePos]).enter()
                                .append("text")
                                .classed("tooltip_line", true)
                                .attr("x", function(d) { return d[0]})
                                .attr("y", function(d) { return d[1]})
                              text.append('tspan').text(formatX);
                              text.append('tspan')
                                  .attr("x", function(d) { return d[0]})
                                  .attr("dy", 16)
                                  .style("font-weight","bold")
                                  .text(kpiType+": ");
                              text.append('tspan')
                                  .attr("dx", 0)
                                  .text(formatY);
                              //.text(parseFloat(yAxisValue).toFixed(3));
                          }

                          //tooltipMouseout
                          function tooltipMouseOut() {
                              var svg = d3.select(_config.rawSvg[0]);
                              svg.selectAll(".tooltip_line").data([]).exit().remove();
                              svg.selectAll(".tooltip_box").data([]).exit().remove();
                          }


                        /* if(index == 0) {
                           svg.selectAll("line.verticalGrid").data(data).enter()
                               .append("line")
                               .attr({
                                   "y1": _config.height,
                                   "y2": _config.margin.top,
                                   "x1": function(d) {
                                       return _config.xScale(d[xkeyVal]);
                                   },
                                   "x2": function(d) {
                                       return _config.xScale(d[xkeyVal]);
                                   },
                                   "stroke": "#dde6eb",
                                   "stroke-width": "1px"
                               }).style("stroke-dasharray", ("3, 3"));
                         }*/

                        //plotting circles on chart
                        /*  var circles = svg.selectAll("circle"+index)
                              .data(data)
                              .enter().append("circle")
                              .attr({
                                  "class": "dots"+index,
                                  "r": 5,
                                  "cx": function(d) {
                                      return _config.xScale(d[xkeyVal]);
                                  },
                                  "cy": function(d) {
                                      return _config.yScale(d[ykeyVal]);
                                  }
                              })*/
                        //plotting lables on chart
                        /*var label = svg.selectAll(".labels"+ (_config.showPathLabel ? index : 0))
                            .data(data)
                            .enter().append("text")
                            .attr("class", "labels")
                            .attr("x", function(d) {
                                return _config.xScale(d[xkeyVal]) - 10;
                            })
                            .attr("y", function(d) {
                                return _config.yScale(d[ykeyVal]) - 10;
                            })
                            .text(function(d, i) {
                                if(_config.showPathLabel) {
                                   return d[ykeyVal] + '%';
                                } else {
                                  return i ===0 ? 'imps.'+ d[ykeyVal] :'';
                                }

                            })*/

                    },

                    drawAxis: function() {
                        var _config = this.lineChartConfig;
                        var xkeyVal = _config.keys.xAxis.val;
                        var ykeyVal = _config.keys.yAxis.val;

                        var svg = d3.select(_config.rawSvg[0]);
                        var height = _config.height;
                        var width = _config.width;
                        var margin = _config.margin;

                        svg.append("svg:g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(10," + height + ")")

                        .call(_config.xAxisGen)

                        svg.append("svg:g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(30,0)")
                            .call(_config.yAxisGen);

                        // if (_config.showAxisLabel) {
                        //     /* START label for x-axis */
                        //     _.each(_config.axisLabel, function(label, i) {
                        //         svg.append('circle')
                        //             .attr({
                        //                 'cx': width / 2 - (i === 0 ? 25 : -25),
                        //                 'cy': height + margin.bottom + 5,
                        //                 'r': 5,
                        //                 'class': 'labelCircle' + i
                        //             })
                        //
                        //         svg.append("text")
                        //             .attr({
                        //                 "text-anchor": "middle",
                        //                 "transform": "translate(" + ((width / 2) + (i === 0 ? 0 : 50)) + "," + (height + margin.bottom * 1.5) + ")",
                        //                 "class": 'labelText' + i
                        //             })
                        //             .text(label);
                        //
                        //     });
                        //
                        //     /* END label for x-axis */
                        // }
                    },

                    setChartParameters: function() {
                        var _config = this.lineChartConfig;
                        var margin = _config.margin;
                        var width = _config.rawSvg.attr("width") - margin.left - margin.right;
                        var height = _config.rawSvg.attr("height") - margin.bottom - margin.top; // TODO: avoid removinh this : -margin.top
                        this.updateConfig({
                            'width': width,
                            'height': height
                        });

                        var that = this;
                        var parseDate = d3.time.format("%Y-%m-%d").parse;
                        _config.dataToPlot[0].forEach(function(d) {
                            d['date'] = parseDate(d['date']);
                        });
                        that.createVariablesToDrawGraph(_config.dataToPlot[0]);

                        _.each(_config.dataToPlot, function(data, idx) {
                            that.drawPath(data, idx);
                        })

                    },

                    updateConfig: function(configValues) {
                        if (typeof configValues === "object") {
                            _.extend(this.lineChartConfig, configValues)
                        }
                    },

                    findKey: function(obj, value) {
                        var key;
                        _.each(obj, function(v, k) {
                            if (v === value) {
                                key = k;
                            }
                        });
                        //if value exists return the corresponding Key else return value
                        return (key != undefined ? key.toUpperCase() : value.toUpperCase());
                    },

                    chartDataFun: function(lineData, threshold, kpiType, chartFrom) {
                        var _config = this.lineChartConfig;
                        var kpiType = kpiType != 'null' ? kpiType : 'NA';
                        var kpiMap = {
                            'cpc': 'gross_ecpc',
                            'cpa': 'gross_ecpa',
                            'cpm': 'gross_ecpm'
                        };
                        if (chartFrom == 'tactics') {
                            kpiType = lineChartService.findKey(kpiMap, kpiType);
                        }
                        _config.kpiType = kpiType;
                        var data = [];

                        for (var i = 0; i < lineData.length; i++) {
                            data.push({
                                date: lineData[i]['date'],
                                values: lineData[i]['y']
                            });
                        }
                        return data;
                    }
                }

                var dataObj = JSON.parse(attrs.chartData);
                var chartDataset = lineChartService.chartDataFun(dataObj.data, dataObj.kpiValue, dataObj.kpiType, dataObj.from);

                //TODO: DO NOT DELETE THIS DATA
                // [{
                //     "date": "2015-1-1",
                //     "values": 150
                // }, {
                //     "date": "2015-1-2",
                //     "values": 100
                // }, {
                //     "date": "2015-1-3",
                //     "values": 170
                // }, {
                //     "date": "2015-1-4",
                //     "values": 180
                // }, {
                //     "date": "2015-1-5",
                //     "values": 190
                // }, {
                //     "date": "2015-1-6",
                //     "values": 180
                // }, {
                //     "date": "2015-1-7",
                //     "values": 130.09
                // }, {
                //     "date": "2015-1-8",
                //     "values": 130.09
                // }, {
                //     "date": "2015-1-9",
                //     "values": 130.09
                // }]

                var lineData = {
                    json: [chartDataset],
                    threshold: dataObj.kpiValue,
                    kpiType: dataObj.kpiType,
                    keys: {
                        xAxis: {
                            val: 'date',
                            ticks: 5,
                            tickValues: [] //_.pluck(a, 'vtc')
                        },
                        yAxis: {
                            val: 'values',
                            name: 'kpiType',
                            tickValues: []
                        }
                    },
                    margin: {
                        top: 20,
                        right: 10,
                        left: 20,
                        bottom: 10,
                    },
                    showPathLabel: true,
                    showAxisLabel: false,
                    axisLabel: ['Data', 'Value']
                };

                //JSON.parse(attrs.chartData).data ;//scope[attrs.chartData].data;
                var rawSvg = elem.find('svg');
                rawSvg.attr("width", attrs.width);
                rawSvg.attr("height", attrs.height);
                lineChartService.updateConfig({
                    rawSvg: rawSvg,
                    dataToPlot: lineData.json,
                    margin: lineData.margin,
                    threshold: lineData.threshold,
                    keys: lineData.keys,
                    showPathLabel: lineData.showPathLabel,
                    showAxisLabel: lineData.showAxisLabel,
                    axisLabel: lineData.axisLabel
                })

                lineChartService.setChartParameters();
                lineChartService.drawAxis();


            }
        }
    });
}());
