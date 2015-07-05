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
                        console.log(data[0])
                        console.log(ykeyVal)
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
                        var svg = d3.select(_config.rawSvg[0]).append('g').attr("transform", "translate(10,0)");



                        //draw the area now
                        /*if(index === 0) {
                          svg.append("path")
                              .datum(data)
                              .attr("class", "area")
                              .attr("d", _config.area);
                        }*/

                        /*    <image preserveAspectRatio="none" x="0" y="25.333333333333336" width="11" height="11" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/assets/images/cdesk/target_indicator_dark.png"></image> */
                        svg.append("image")
                            .attr("id", "goal")
                            .attr("width", "11")
                            .attr("height", "11")
                            .attr("x", 5)
                            .attr("y", _config.yScale(150))
                            .attr("xlink:href", "http://localhost:9000/assets/images/cdesk/target_indicator_dark.png")


                        svg.append("line")
                            .style("stroke-width", "2")
                            .style("stroke", "#C0D0E0")
                            .attr("id", "threshold-line")
                            .attr("x1", _config.margin.left).attr("y1", _config.yScale(150))
                            .attr("x2", _config.width).attr("y2", _config.yScale(150));

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



                        svg.append("svg:path")
                            .attr('stroke', 'url(#temperature-gradient)')
                            .attr({
                                d: _config.lineFun(data),
                                "class": "path" + index
                            });




                        //draw threshold
                        svg.append("linearGradient")
                            .attr("id", "temperature-gradient")
                            .attr("gradientUnits", "userSpaceOnUse")
                            .attr("x1", 0).attr("y1", _config.yScale(150))
                            .attr("x2", 0).attr("y2", _config.yScale(150.1))
                            .selectAll("stop")
                            .data([{
                                    offset: "0%",
                                    color: "#f24444"
                                }, {
                                    offset: "50%",
                                    color: "#f24444"
                                }, //negative
                                {
                                    offset: "50%",
                                    color: "#0078cc"
                                }, {
                                    offset: "100%",
                                    color: "#0078cc"
                                }
                            ])
                            .enter().append("stop")
                            .attr("offset", function(d) {
                                return d.offset;
                            })
                            .attr("stop-color", function(d) {
                                return d.color;
                            });



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

                        if (_config.showAxisLabel) {
                            /* START label for x-axis */
                            _.each(_config.axisLabel, function(label, i) {
                                svg.append('circle')
                                    .attr({
                                        'cx': width / 2 - (i === 0 ? 25 : -25),
                                        'cy': height + margin.bottom + 5,
                                        'r': 5,
                                        'class': 'labelCircle' + i
                                    })

                                svg.append("text")
                                    .attr({
                                        "text-anchor": "middle",
                                        "transform": "translate(" + ((width / 2) + (i === 0 ? 0 : 50)) + "," + (height + margin.bottom * 1.5) + ")",
                                        "class": 'labelText' + i
                                    })
                                    .text(label);

                            });


                            /* END label for x-axis */
                        }
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
                        console.log(_config.dataToPlot[0]);
                        that.createVariablesToDrawGraph(_config.dataToPlot[0]);

                        _.each(_config.dataToPlot, function(data, idx) {

                            that.drawPath(data, idx);
                        })

                    },

                    updateConfig: function(configValues) {
                        if (typeof configValues === "object") {
                            _.extend(this.lineChartConfig, configValues)
                        }
                    }
                }
                var lineData = {
                    json: [
                        [{
                            "date": "2015-1-1",
                            "values": 150
                        }, {
                            "date": "2015-1-2",
                            "values": 100
                        }, {
                            "date": "2015-1-3",
                            "values": 170
                        }, {
                            "date": "2015-1-4",
                            "values": 180
                        }, {
                            "date": "2015-1-5",
                            "values": 190
                        }, {
                            "date": "2015-1-6",
                            "values": 180
                        }, {
                            "date": "2015-1-7",
                            "values": 130.09
                        }, {
                            "date": "2015-1-8",
                            "values": 130.09
                        }, {
                            "date": "2015-1-9",
                            "values": 130.09
                        }]
                    ],
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
                        top:20,
                        right: 10,
                        left: 20,
                        bottom: 10,
                    },
                    showPathLabel: true,
                    showAxisLabel: false,
                    axisLabel: ['Plays', 'Views']
                };
                console.log(lineData.json);
                //JSON.parse(attrs.chartData).data ;//scope[attrs.chartData].data;
                var rawSvg = elem.find('svg');
                rawSvg.attr("width", attrs.width);
                rawSvg.attr("height", attrs.height);
                lineChartService.updateConfig({
                    rawSvg: rawSvg,
                    dataToPlot: lineData.json,
                    margin: lineData.margin,
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
