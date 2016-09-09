define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('quartilesGraph', function () {
        return {
            restrict: 'EA',
            template: '<svg></svg>',

            link: function (scope, elem, attrs) {

                var lineChartService  = {
                        lineChartConfig: {},

                        createVariablesToDrawGraph:  function (data) {
                            var _config = this.lineChartConfig,
                                xKeyVal = _config.keys.xAxis.val,
                                yKeyVal = _config.keys.yAxis.val,
                                margin = _config.margin,
                                width  = _config.width,
                                height = _config.height,

                                xScale = d3
                                    .scale
                                    .linear()
                                    .domain([data[0][xKeyVal],
                                    data[data.length - 1][xKeyVal]])
                                    .range([margin.left, width]),

                                yScale = d3
                                    .scale
                                    .linear()
                                    .domain([0, d3.max(data, function (d) {
                                        return d[yKeyVal];
                                    })])
                                    .range([height, margin.left]),

                                xAxisGen = d3
                                    .svg
                                    .axis()
                                    .scale(xScale)
                                    .orient('bottom')
                                    .tickValues(_config.keys.xAxis.tickValues)
                                    .tickFormat(function (d, i) {
                                        if (_config.showAxisLabel && i === 0) {
                                            return 'Ad start';
                                        } else{
                                            return d === 0 ? d : (d +'%');
                                        }
                                    }),

                                yAxisGen = d3
                                    .svg
                                    .axis()
                                    .scale(yScale)
                                    .orient('left')
                                    .tickValues(_config.keys.yAxis.tickValues.length > 0 ?
                                        _config.keys.yAxis.tickValues : 1),

                                // define area
                                area = d3
                                    .svg
                                    .area()
                                    .x(function (d) {
                                        return xScale(d[xKeyVal]);
                                    })
                                    .y0(height)
                                    .y1(function (d) {
                                        return yScale(d[yKeyVal]);
                                    }),

                                // draw a ling function
                                lineFun = d3
                                    .svg
                                    .line()
                                    .x(function (d) {
                                        return xScale(d[xKeyVal]);
                                    })
                                    .y(function (d) {
                                        return yScale(d[yKeyVal]);
                                    });

                            this.updateConfig({
                                xScale: xScale,
                                yScale: yScale,
                                xAxisGen: xAxisGen,
                                yAxisGen: yAxisGen,
                                area: area,
                                lineFun: lineFun
                            });
                        },

                        drawPath:  function (data, index) {
                            var _config = this.lineChartConfig,
                                xKeyVal = _config.keys.xAxis.val,
                                yKeyVal = _config.keys.yAxis.val,
                                graphTooltip,
                                label,
                                svg = d3.select(_config.rawSvg[0]),

                                // plotting circles on chart
                                circles = svg
                                    .selectAll('circle'+index)
                                    .data(data)
                                    .enter()
                                    .append('circle')
                                    .attr({
                                        'class': 'dots'+index,
                                        r: 5,

                                        cx: function (d) {
                                            return _config.xScale(d[xKeyVal]);
                                        },

                                        cy: function (d) {
                                            return _config.yScale(d[yKeyVal]);
                                        }
                                    });

                            // draw the area now
                            if (index === 0) {
                                svg
                                    .append('path')
                                    .datum(data)
                                    .attr('class', 'area')
                                    .attr('d', _config.area);
                            }

                            svg
                                .append('svg:path')
                                .attr({
                                    d: _config.lineFun(data),
                                    'class': 'path'+index
                                });

                            if (index === 0) {
                                svg
                                    .selectAll('line.verticalGrid').
                                    data(data)
                                    .enter()
                                    .append('line')

                                    .attr({
                                        y1: _config.height,

                                        y2: function (d) {
                                              return _config.yScale(d[yKeyVal]);
                                        },

                                        x1: function (d) {
                                            return _config.xScale(d[xKeyVal]);
                                        },

                                        x2: function (d) {
                                            return _config.xScale(d[xKeyVal]);
                                        },

                                        stroke: '#dde6eb',
                                        'stroke-width': '1px'
                                    })

                                    .style('stroke-dasharray', ('3, 3'));
                            }

                            if (_config.graphTooltip) {
                                graphTooltip = d3.selectAll('.graphTooltip');

                                circles.on('mouseover', function (d) {
                                    graphTooltip.style('opacity', 0.9).html(d.values);

                                    graphTooltip
                                        .style('left', (d3.mouse(this)[0]) + 'px')
                                        .style('top', (d3.mouse(this)[1] + 28) + 'px');
                                }).on('mouseout', function () {
                                    graphTooltip
                                        .transition()
                                        .duration(500)
                                        .style('opacity', 0);
                                });
                            }

                            // plotting lables on chart
                            if (index === 0) {
                                label = svg.selectAll('.labels' + (_config.showPathLabel ? index : 0))
                                    .data(data)
                                    .enter().append('text')
                                    .attr('class', 'labels')
                                    .attr('x', function (d) {
                                        return _config.xScale(d[xKeyVal]) - 10;
                                    })
                                    .attr('y', function (d) {
                                        return _config.yScale(d[yKeyVal]) - 10;
                                    })
                                    .text(function (d, i) {
                                        if (_config.showPathLabel) {
                                            return d[yKeyVal] + '%';
                                        } else {
                                            return i === 0 ? 'Imps.' + d[yKeyVal] : '';
                                        }
                                    });
                            }
                        },

                        drawAxis:  function () {
                            var _config = this.lineChartConfig,
                                svg = d3.select(_config.rawSvg[0]),
                                height = _config.height,
                                width = _config.width,
                                margin = _config.margin;

                            svg
                                .append('svg:g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' +height + ')')
                                .call(_config.xAxisGen);

                            svg
                                .append('svg:g')
                                .attr('class', 'y axis')
                                .attr('transform', 'translate(20,0)')
                                .call(_config.yAxisGen);

                            if (_config.showAxisLabel) {
                                // START label for x-axis
                                _.each(_config.axisLabel, function (label, i) {
                                    svg
                                        .append('circle')
                                        .attr({
                                            cx: width/2 - (i===0 ? 25 : -25),
                                            cy: height + margin.bottom + 13,
                                            r: 5,
                                            'class': 'labelCircle' + i
                                        });

                                    svg
                                        .append('text')
                                        .attr({
                                            'text-anchor': 'middle',

                                            transform: 'translate('+ ((width/2) + (i===0 ? 0 : 50) ) + ',' +
                                                (height + margin.bottom*1.8)+')',

                                            'class': 'labelText'+i
                                        })
                                        .text(label);

                                });
                                // END label for x-axis
                            }
                        },

                        setChartParameters:  function () {
                            var _config = this.lineChartConfig,
                                margin = _config.margin,
                                width = _config.rawSvg.attr('width') - margin.left - margin.right,
                                height = _config.rawSvg.attr('height') - margin.bottom - margin.top,
                                that = this;

                            this.updateConfig({
                                width: width,
                                height: height
                            });

                            that.createVariablesToDrawGraph(_config.dataToPlot);

                            that.drawPath(_config.dataToPlot, 0);
                        },

                        updateConfig: function (configValues) {
                            if ( typeof configValues === 'object' ) {
                                _.extend(this.lineChartConfig, configValues);
                            }
                        }
                    },

                    lineData = JSON.parse(attrs.chartData).data,
                    rawSvg = elem.find('svg');

                rawSvg.attr('width', attrs.width);
                rawSvg.attr('height', attrs.height);

                lineChartService.updateConfig({
                    rawSvg: rawSvg,
                    dataToPlot: _.sortBy(lineData.json[0], 'vtc'),
                    margin: lineData.margin,
                    keys: lineData.keys,
                    showPathLabel: lineData.showPathLabel,
                    showAxisLabel: lineData.showAxisLabel,
                    axisLabel: lineData.axisLabel,
                    graphTooltip: lineData.graphTooltip
                });

                lineChartService.setChartParameters();
                lineChartService.drawAxis();
            }
        };
    });
});
