define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignChart', ['$window', '$filter', 'constants', function ($window, $filter, constants) {
        return {
            restrict: 'EA',
            template: '<svg></svg>',

            link: function (scope, elem, attrs) {
                var lineChartService,
                    kpiPrefix,
                    kpiSuffix,
                    getCircleSLNo,
                    getOverlapFlag,
                    getActivityCountLabel,
                    chartClick,
                    wordwrap,
                    getCircleStatus,
                    chartMouseOver,
                    chartMouseOut,
                    dataObj,
                    chartCallFrom,
                    versionTag,
                    deliveryData,
                    chartDataset,
                    reverseUpperPacing,
                    pacing,
                    lineData,
                    rawSvg,
                    performanceChart;

                lineChartService = {
                    lineChartConfig: {},

                    createVariablesToDrawGraph: function (data) {
                        var _config = this.lineChartConfig,
                            xkeyVal = _config.keys.xAxis.val,
                            ykeyVal = _config.keys.yAxis.val,
                            margin = _config.margin,
                            width = _config.width,
                            height = _config.height,
                            xAxisGen,
                            yAxisGen,
                            xScale = d3.time.scale().domain([data[0][xkeyVal],
                            data[data.length - 1][xkeyVal]]).range([margin.left, width]),

                            yScale = d3
                                .scale
                                .linear()
                                .domain([0, d3.max(data, function (d) {
                                    return d[ykeyVal];
                                })]).range([height, margin.left]),

                            ticksData,
                            median,
                            timeExtent,
                            numberFormat,
                            lineFun;

                        if (_config.isPerformanceChart) {
                            ticksData = data.length > 7 ? 5 : data.length - 1;
                        } else {
                            ticksData = _config.keys.xAxis.ticks;
                        }

                        xAxisGen = d3
                            .svg
                            .axis()
                            .scale(xScale)
                            .orient('bottom')
                            .ticks(ticksData)
                            .tickFormat(d3.time.format('%_d %b'))
                            .tickSize(0);

                        // tick control
                        if (!_config.isPerformanceChart && data !== null) {
                            timeExtent = d3.extent(data, function (d) {
                                return Date.parse(d.date);
                            });

                            median = d3.median(timeExtent);

                            xAxisGen.tickValues([
                                // begin
                                new Date(timeExtent[0]),

                                // median
                                new Date(median),

                                // end
                                new Date(timeExtent[1])
                            ]);
                        }

                        numberFormat = d3.format('.f');

                        yAxisGen = d3
                            .svg
                            .axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(_config.keys.yAxis.ticks)
                            .tickPadding(10)
                            .tickFormat(function (d) {
                                return kpiPrefix(_config.kpiType) + ' ' + numberFormat(d) + ' ' +
                                    kpiSuffix(_config.kpiType);
                            });

                        // draw a line function
                        lineFun = d3
                            .svg
                            .line()
                            .x(function (d) {
                                return xScale(d[xkeyVal]);
                            })
                            .y(function (d) {
                                return yScale(d[ykeyVal]);
                            });

                        this.updateConfig({
                            'xScale': xScale,
                            'yScale': yScale,
                            'xAxisGen': xAxisGen,
                            'yAxisGen': yAxisGen,
                            'lineFun': lineFun
                        });
                    },

                    drawPath: function (data, index) {
                        // parse the dates from a string into a date object
                        var _config = this.lineChartConfig,
                            ykeyVal = _config.keys.yAxis.val,
                            threshold = _config.threshold,
                            kpiType = _config.kpiType,
                            chartCallFrom = _config.chartCallFrom,
                            adjustment = 10,
                            svg,
                            maxData,
                            adjustY,
                            imageSize,
                            imagePosition,
                            addCrossHair,
                            line,
                            red,
                            blue,
                            aboveClass,
                            belowClass,
                            maxUpperThreshold,
                            upperPacingLine,
                            lowerPacingLine,
                            defs,
                            clipPath,
                            drawClipPoly,
                            drawPolygon,
                            reversePacingLine,
                            clipId,
                            actionItems,
                            external,
                            showExternal,
                            countActivityItem,
                            findPlacedActivity,
                            eFlag,
                            position,
                            flag,
                            counter,
                            defaultGrey,
                            bisectDate,
                            activityCount,
                            extSLNo,
                            intSLNo,
                            overlapResult,
                            activityDateArray,
                            getParams,
                            selectedCampaignId,
                            markerData,
                            marker,
                            markerBorder;

                        // resize domain of y-axis
                        function updateDomain(maxData, percentage) {
                            var adjustment = (maxData * percentage) / 100,
                                newMax = adjustment + maxData;

                            if (newMax > 0) {
                                _config.yScale.domain([0, newMax]);
                            }
                        }

                        // tooltipMouseOver
                        function tooltipMouseOver() { // jshint ignore:line
                            var svg = d3
                                .select(_config.rawSvg[0]),
                                mousePos = d3.mouse(this), // jshint ignore:line
                                yAxisValue = _config.yScale.invert(mousePos[1]),
                                xAxisValue = _config.xScale.invert(mousePos[0]),
                                formatY = parseFloat(yAxisValue).toFixed(2),
                                formatX = moment(xAxisValue).format('dddd, D MMM, YYYY'),
                                rect,
                                text,

                            // calculating the plotting position
                                WIDTH = _config.width,
                                HEIGHT = _config.height,
                                w = 160,
                                h = 40,
                                x = mousePos[0],
                                y = mousePos[1];

                            // if overflow in width
                            if ((x + w) > WIDTH) {
                                x = x - 10 - w;
                            }

                            // if overflow in height
                            if ((y + h) > HEIGHT) {
                                y = HEIGHT - h;
                            }

                            rect = svg
                                .selectAll('.tooltip_box')
                                .data([mousePos])
                                .enter()
                                .append('rect')
                                .attr('class', 'tooltip_box')
                                .attr('x', function () {
                                    return x + 20;
                                })
                                .attr('y', function () {
                                    return y - 5;
                                })
                                .attr('width', w)
                                .attr('height', h);

                            text = svg
                                .selectAll('.tooltip_line')
                                .data([mousePos])
                                .enter()
                                .append('text')
                                .classed('tooltip_line', true)
                                .attr('x', function () {
                                    return x + 30;
                                })
                                .attr('y', function () {
                                    return y + 10;
                                });

                            text.append('tspan').text(formatX);

                            text
                                .append('tspan')
                                .attr('x', function () {
                                    return x + 30;
                                })
                                .attr('dy', 16)
                                .style('font-weight', 'bold')
                                .text(kpiType + ': ');

                            text
                                .append('tspan')
                                .attr('dx', 0)
                                .text(formatY);
                        }

                        // tooltipMouseout
                        function tooltipMouseOut() {
                            var svg = d3.select(_config.rawSvg[0]);

                            svg.selectAll('.tooltip_line').remove();
                            svg.selectAll('.tooltip_box').remove();
                        }

                        function mousemove() {
                            var x0 = _config.xScale.invert(d3.mouse(this)[0]), // jshint ignore:line
                                i = bisectDate(data, x0, 1),
                                d0 = data[i - 1],
                                d1 = data[i],
                                d,
                                svg,
                                mousePos,
                                formatX,
                                formatY,
                                WIDTH,
                                HEIGHT,
                                w,
                                h,
                                x,
                                y,
                                rect,
                                text;

                            if (d0 && d1) {
                                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                            } else {
                                return false;
                            }

                            svg = d3.select(_config.rawSvg[0]);
                            mousePos = d3.mouse(this); // jshint ignore:line
                            formatY = parseFloat(d.values).toFixed(2);
                            formatX = moment(d.date).format('dddd, D MMM, YYYY');

                            if (kpiType.toLowerCase() === 'impressions') {
                                // delivery in tooltips shown as integer
                                formatY = parseInt(d.values);
                                formatY = $filter('nrFormat')(formatY, 0);
                            }

                            svg.selectAll('.tooltip_line').remove();
                            svg.selectAll('.tooltip_box').remove();

                            // calculating the plotting position
                            WIDTH = _config.width;
                            HEIGHT = _config.height;
                            w = 160;
                            h = 40;
                            x = _config.xScale(_config.xScale.invert(d3.mouse(this)[0])); // jshint ignore:line
                            y = _config.yScale(d.values);

                            // if overflow in width
                            if ((x + w) > WIDTH) {
                                x = x - 20 - w;
                            }

                            // if overflow in height
                            if ((y + h) > HEIGHT) {
                                y = HEIGHT - h;
                            }

                            rect = svg
                                .append('rect')
                                .attr('class', 'tooltip_box')
                                .attr('x', function () {
                                    return x + 20;
                                })
                                .attr('y', function () {
                                    return y - 5;
                                })
                                .attr('width', w)
                                .attr('height', h);

                            text = svg
                                .append('text')
                                .classed('tooltip_line', true)
                                .attr('x', function () {
                                    return x + 30;
                                })
                                .attr('y', function () {
                                    return y + 10;
                                });

                            text.append('tspan').text(formatX);

                            text
                                .append('tspan')
                                .attr('x', function () {
                                    return x + 30;
                                })
                                .attr('dy', 16)
                                .style('font-weight', 'bold')
                                .text(kpiType + ': ');

                            text.append('tspan').attr('dx', 0).text(formatY);
                        }

                        if (_config.isPerformanceChart) {
                            adjustment = 30;
                        }

                        svg = d3
                            .select(_config.rawSvg[0])
                            .append('g')
                            .attr('transform', 'translate(' + adjustment + ',0)');

                        // lines for the border of the chart
                        svg.append('line')
                            .style('stroke-width', '1')
                            .style('stroke', '#C0D0E0')
                            .attr('id', 'threshold-line')
                            .attr('x1', _config.margin.left).attr('y1', _config.margin.top)
                            .attr('x2', _config.width).attr('y2', _config.margin.top);

                        svg.append('line')
                            .style('stroke-width', '1')
                            .style('stroke', '#C0D0E0')
                            .attr('id', 'threshold-line')
                            .attr('x1', _config.width).attr('y1', _config.height)
                            .attr('x2', _config.width).attr('y2', _config.margin.top);

                        // find the max data
                        maxData = d3.max(data, function (d) {
                            return d[ykeyVal];
                        });

                        if (_config.isPerformanceChart) {
                            if (chartCallFrom === 'action_optimization' ||
                                _config.kpiType.toLowerCase() === 'action rate') {
                                adjustY = 10;
                            } else if (_config.kpiType.toLowerCase() === 'impressions') {
                                adjustY = 14;
                            } else {
                                adjustY = 20;
                            }

                            svg.append('text')
                                .attr('id', 'kpi_type_text')
                                .attr('x', -15)
                                .attr('y', adjustY - 5)
                                .style('font-size', '12px')
                                .style('fill', '#57595b')
                                .text(_config.kpiType);
                        }

                        if (threshold !== 0 && kpiType.toLowerCase() !== 'impressions') {
                            // if there is a threshold, then draw goal icon, line and render threshold encoding

                            // if threshold is out of view i.e greater than data view
                            if (threshold > maxData) {
                                // rescale yaxis
                                _config.yScale.domain([0, threshold]);
                            }

                            // resize domain of y-axis 20% extra spacing
                            updateDomain(maxData, 20);

                            imageSize = '11';
                            imagePosition = 5;

                            // if performance chart
                            if (_config.isPerformanceChart) {
                                imageSize = '13';
                                imagePosition = -30;

                                addCrossHair = function (xCoord, yCoord) { // jshint ignore:line
                                    // Update vertical cross hair
                                    if (xCoord > 21) {
                                        // show crosshair inside view
                                        d3
                                            .select('#v_crosshair')
                                            .attr('x1', xCoord)
                                            .attr('y1', _config.height)
                                            .attr('x2', xCoord)
                                            .attr('y2', _config.margin.top)
                                            .style('display', 'block');
                                    }
                                };

                                // vertical cross hair
                                svg.append('g')
                                    .attr('class', 'crosshair')
                                    .append('line')
                                    .attr('id', 'v_crosshair')
                                    .attr('x1', 0)
                                    .attr('y1', 0)
                                    .attr('x2', 0)
                                    .attr('y2', 0)
                                    .style('stroke', '#C0C0C0')
                                    .style('stroke-width', '1px')
                                    .style('stroke-dasharray', '4,3')
                                    .style('display', 'none');

                                svg
                                    .on('mousemove', function () {
                                        var xCoord = d3.mouse(this)[0],
                                            yCoord = d3.mouse(this)[1];

                                        addCrossHair(xCoord, yCoord);
                                    })
                                    .on('mouseover', function () {
                                        d3.selectAll('.crosshair').style('display', 'block');
                                    })
                                    .on('mouseout', function () {
                                        d3.selectAll('.crosshair').style('display', 'none');
                                    });
                            }

                            // check for performance chart ends
                            svg.append('image')
                                .attr('id', 'goal')
                                .attr('width', imageSize)
                                .attr('height', imageSize)
                                .attr('x', imagePosition)
                                .attr('y', _config.yScale(threshold) - 5)
                                .attr('xlink:href', assets.target_marker);

                            svg.append('line')
                                .style('stroke-width', '2')
                                .style('stroke', '#C0D0E0')
                                .attr('id', 'threshold-line')
                                .attr('x1', _config.margin.left).attr('y1', _config.yScale(threshold))
                                .attr('x2', _config.width).attr('y2', _config.yScale(threshold));

                            // interpolate path data
                            line = d3
                                .svg
                                .line()
                                .interpolate('basis')
                                .x(function (d) {
                                    return _config.xScale(d.date);
                                })
                                .y(function (d) {
                                    return _config.yScale(d.values);
                                });

                            // classes used to color the threshold clipping path
                            red = 'clip-above-' + _config.versionTag;
                            blue = 'clip-below-' + _config.versionTag;

                            // default settings - positive color is blue and is below and danger zone is red
                            // that is above
                            aboveClass = blue;
                            belowClass = red;

                            if (kpiType.toLowerCase() === 'cpc' ||
                                kpiType.toLowerCase() === 'cpa' ||
                                kpiType.toLowerCase() === 'cpm') {
                                // positive color is blue that is above and danger zone is below that is red
                                aboveClass = red;
                                belowClass = blue;
                            }

                            // clipPath area for threshold encoding
                            svg
                                .append('clipPath')
                                .attr('id', aboveClass)
                                .append('rect')
                                .attr('width', _config.width)
                                .attr('height', _config.yScale(threshold));

                            svg
                                .append('clipPath')
                                .attr('id', belowClass)
                                .append('rect')
                                .attr('y', _config.yScale(threshold))
                                .attr('width', _config.width)
                                .attr('height', _config.height - _config.yScale(threshold));

                            // apply threshold encoding color classes to the path data
                            svg
                                .selectAll('.line')
                                .data(['above', 'below'])
                                .enter().append('path')
                                .attr('class', function (d) {
                                    return 'line ' + d;
                                })
                                .attr('clip-path', function (d) {
                                    return 'url(#clip-' + d + '-' + _config.versionTag + ')';
                                })
                                .datum(data)
                                .attr('d', line);
                        } else {
                            // if no threshold
                            if (kpiType.toLowerCase() === 'impressions') {
                                // delivery as kpi
                                maxUpperThreshold = d3.max(data, function (d) {
                                    return d.upperPacing;
                                });

                                if (maxUpperThreshold > maxData) {
                                    updateDomain(maxUpperThreshold, 20);
                                }

                                upperPacingLine = d3
                                    .svg
                                    .line()
                                    .interpolate('basis')
                                    .x(function (d) {
                                        return _config.xScale(d.date);
                                    })
                                    .y(function (d) {
                                        return _config.yScale(d.upperPacing);
                                    });

                                svg
                                    .append('svg:path')
                                    .attr({
                                        d: upperPacingLine(data),
                                        'class': 'upper_pacing'
                                    })
                                    .style({'stroke': '#DDE6EB', 'stroke-dasharray': 5, 'fill': 'none'});

                                lowerPacingLine = d3
                                    .svg
                                    .line()
                                    .interpolate('basis')
                                    .x(function (d) {
                                        return _config.xScale(d.date);
                                    })
                                    .y(function (d) {
                                        return _config.yScale(d.lowerPacing);
                                    });

                                svg
                                    .append('svg:path')
                                    .attr({
                                        d: lowerPacingLine(data),
                                        'class': 'upper_pacing'
                                    })
                                    .style({'stroke': '#DDE6EB', 'stroke-dasharray': 5, 'fill': 'none'});

                                // CREATE DEFINITION FOR COLOR CLIPPING
                                defs = svg.append('svg:defs');

                                clipPath = defs.append('svg:clipPath')
                                    .attr('id', 'delivery-clip-' + _config.versionTag);

                                drawClipPoly = function () {
                                    return drawPolygon(_config.reverseUpperPacing).replace('M', '');
                                };

                                drawPolygon = d3
                                    .svg
                                    .line()
                                    .x(function (d) {
                                        return _config.xScale(_config.parseDate(d.date));
                                    })
                                    .y(function (d) {
                                        return _config.yScale(d.pacing);
                                    })
                                    .interpolate(function (points) {
                                        return points.join(' ');
                                    });

                                // POLYGON TO CLIP COLOR
                                clipPath.append('svg:polygon')
                                    .attr('class', 'area_clip')
                                    .attr('points', drawClipPoly);

                                reversePacingLine = d3
                                    .svg
                                    .line()
                                    .interpolate('basis')
                                    .x(function (d) {
                                        return _config.xScale(_config.parseDate(d.date));
                                    })
                                    .y(function (d) {
                                        return _config.yScale(d.pacing);
                                    });

                                // DRAW IMPRESSIONS PATH
                                svg
                                    .append('svg:path')
                                    .attr({
                                        d: _config.lineFun(data),
                                        'class': 'path' + index
                                    })
                                    .style({'stroke': '#f24444', 'stroke-width': 2, 'fill': 'none'});

                                clipId = 'url(#delivery-clip-' + versionTag + ')';

                                // DRAW CLIPPED PATH
                                svg
                                    .append('svg:path')
                                    .attr('clip-path', clipId)
                                    .attr({
                                        d: _config.lineFun(data),
                                        'class': 'path' + index
                                    });
                            } else {
                                // resize domain of y-axis 20% extra spacing
                                updateDomain(maxData, 20);

                                // render default color to the path
                                svg
                                    .append('svg:path')
                                    .attr({
                                        d: _config.lineFun(data),
                                        'class': 'path' + index
                                    });
                            }
                            // END OF KPI
                        }
                        // END OF NO THRESHOLD CHECK

                        svg
                            .append('rect')
                            .attr('class', 'overlay')
                            .attr('width', _config.width)
                            .attr('height', _config.height)
                            .on('mousemove', mousemove)
                            .on('mouseout', tooltipMouseOut);

                        bisectDate = d3
                            .bisector(function (d) {
                                return d.date;
                            })
                            .left;

                        if (_config.isPerformanceChart) {
                            // TODO: prepare activity data

                            actionItems = [];
                            external = _config.external;

                            if (external !== undefined && external === true) {
                                // filter applied
                                showExternal = true;
                            }

                            countActivityItem = [];
                            findPlacedActivity = [];
                            eFlag = 0;
                            position = 0;
                            flag = [];
                            counter = 0;
                            defaultGrey = _config.defaultGrey;

                            if (_config.activityList) {
                                _.each(data, function (seriesData) {
                                    position = 0;

                                    _.each(_config.activityList, function (activityData) {
                                        var dateUTC = new Date(activityData.created_at),
                                            arrayVar,
                                            checkMoreThanOne,
                                            activityId,

                                            actionUTC = Date.UTC(
                                                dateUTC.getUTCFullYear(),
                                                dateUTC.getUTCMonth(),
                                                dateUTC.getUTCDate()
                                            );

                                        if (moment(seriesData.date).format('YYYY-MM-DD') ===
                                            moment(activityData.created_at).format('YYYY-MM-DD')) {
                                            if (flag[actionUTC] === undefined) {
                                                flag[actionUTC] = 1;
                                            }

                                            if ((showExternal && activityData.make_external === true) ||
                                                (showExternal === undefined)) {
                                                eFlag = activityData.make_external;

                                                if (countActivityItem[actionUTC] === undefined) {
                                                    countActivityItem[actionUTC] = [];
                                                    countActivityItem[actionUTC].externalIDS = [];
                                                    countActivityItem[actionUTC].internalIDS = [];
                                                    countActivityItem[actionUTC].external = 0;
                                                    countActivityItem[actionUTC].internal = 0;
                                                }

                                                if (eFlag === true) {
                                                    if (countActivityItem[actionUTC].external !== undefined) {
                                                        countActivityItem[actionUTC].external++;
                                                        arrayVar = 'externalIDS';
                                                    }
                                                } else {
                                                    arrayVar = 'internalIDS';

                                                    if (countActivityItem[actionUTC].internal !== undefined) {
                                                        countActivityItem[actionUTC].internal++;
                                                    }
                                                }

                                                activityId = activityData.ad_id + '' + activityData.id;

                                                checkMoreThanOne =
                                                    countActivityItem[actionUTC][arrayVar].length > 0 ? ',' : '';

                                                countActivityItem[actionUTC][arrayVar] =
                                                    countActivityItem[actionUTC][arrayVar] +
                                                    checkMoreThanOne +
                                                    activityId;
                                            }
                                        }
                                    });
                                    // end of activity data iteration
                                });
                                // end of series data iteration
                            }

                            activityCount = 0;
                            extSLNo = 1;
                            intSLNo = 1;
                            activityDateArray = [];
                            getParams = (document.URL).split(/[\s/]+/);

                            selectedCampaignId = getParams[getParams.length - 1] === 'optimization' ?
                                JSON.parse(localStorage.getItem('selectedCampaign')).id :
                                getParams[getParams.length - 1];

                            if (_config.activityList) {
                                _.each(data, function (seriesData) {
                                    position = 0;

                                    _.each(_config.activityList, function (activityData) {
                                        var dateUTC = new Date(activityData.created_at),
                                            newActivity,
                                            checkFlag,
                                            arrayVar,
                                            idList,
                                            overlapFlag,
                                            circleInfo,
                                            circleSLNo,

                                            actionUTC = Date.UTC(
                                                dateUTC.getUTCFullYear(),
                                                dateUTC.getUTCMonth(),
                                                dateUTC.getUTCDate()
                                            );

                                        if (moment(seriesData.date).format('YYYY-MM-DD') ===
                                            moment(activityData.created_at).format('YYYY-MM-DD')) {
                                            newActivity = undefined;

                                            if (flag[actionUTC] === undefined) {
                                                flag[actionUTC] = 1;
                                            }

                                            if ((showExternal && activityData.make_external === true) ||
                                                (showExternal === undefined)) {
                                                checkFlag = activityData.make_external === true ?
                                                    'external' : 'internal';

                                                arrayVar = activityData.make_external === true ?
                                                    'externalIDS' : 'internalIDS';

                                                idList = countActivityItem[actionUTC][arrayVar];
                                                activityCount = countActivityItem[actionUTC][checkFlag];

                                                if (activityCount === 1) {
                                                    circleInfo = getCircleSLNo(activityData.make_external, extSLNo,
                                                        intSLNo, actionUTC, selectedCampaignId);

                                                    circleSLNo = circleInfo.circleSLNo;

                                                    // Get Increment Id for external and Internal SL Number
                                                    extSLNo = circleInfo.extSLNo;
                                                    intSLNo = circleInfo.intSLNo;
                                                    overlapResult = getOverlapFlag(activityDateArray, actionUTC);
                                                    activityDateArray = overlapResult.activityDateArray;
                                                    overlapFlag = overlapResult.overlapFlag;

                                                    // TODO: DRAW MARKER WITH ONE ACTIVITY
                                                    newActivity = {
                                                        date: _config.parseDate(
                                                            moment(activityData.created_at)
                                                            .format('YYYY-MM-DD')
                                                        ),

                                                        values: seriesData.values,
                                                        name: activityData.ad_name,
                                                        id: activityData.ad_id + '' + activityData.id,
                                                        comment: activityData.comment,
                                                        activityCount: activityCount,
                                                        make_external: activityData.make_external,
                                                        id_list: idList,
                                                        circleSLNo: circleSLNo,
                                                        overlapFlag: overlapFlag,
                                                        kpiType: kpiType,
                                                        defaultGrey: defaultGrey,
                                                        action_color: activityData.action_color,
                                                        position: position,

                                                        flagId: activityData.make_external === true ?
                                                            'external' : 'internal'
                                                    };

                                                    actionItems.push(newActivity);

                                                    counter++;
                                                    position += 20;
                                                    // correction for multiple markers in the same place
                                                } else {
                                                    if (findPlacedActivity[actionUTC] === undefined) {
                                                        findPlacedActivity[actionUTC] = [];
                                                        findPlacedActivity[actionUTC].external = 0;
                                                        findPlacedActivity[actionUTC].internal = 0;
                                                    }

                                                    // Multiple Item in single chart
                                                    if (findPlacedActivity[actionUTC][checkFlag] !== 'completed') {
                                                        findPlacedActivity[actionUTC][checkFlag] = 'completed';
                                                        circleInfo = getCircleSLNo(activityData.make_external,
                                                            extSLNo, intSLNo, actionUTC, selectedCampaignId);

                                                        // Get circle SL Number
                                                        circleSLNo = circleInfo.circleSLNo;

                                                        // Get Increment Id for external and Internal SL Number
                                                        extSLNo = circleInfo.extSLNo;
                                                        intSLNo = circleInfo.intSLNo;

                                                        overlapResult =
                                                            getOverlapFlag(activityDateArray, actionUTC);

                                                        activityDateArray = overlapResult.activityDateArray;
                                                        overlapFlag = overlapResult.overlapFlag;

                                                        // TODO: DRAW ACTIVITY MARKER WITH THIS DATA
                                                        newActivity = {
                                                            date: _config.parseDate(
                                                                moment(activityData.created_at).format('YYYY-MM-DD')
                                                            ),

                                                            values: seriesData.values,
                                                            name: activityData.ad_name,
                                                            id: activityData.ad_id + '' + activityData.id,
                                                            comment: activityData.comment,
                                                            activityCount: activityCount,
                                                            make_external: activityData.make_external,
                                                            id_list: idList,
                                                            circleSLNo: circleSLNo,
                                                            overlapFlag: overlapFlag,
                                                            kpiType: kpiType,
                                                            defaultGrey: defaultGrey,
                                                            action_color: activityData.action_color,
                                                            position: position,

                                                            flagId: activityData.make_external === true ?
                                                                'external' : 'internal'
                                                        };

                                                        actionItems.push(newActivity);
                                                        counter++;
                                                        position += 20;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                    // iteration of activity data
                                });
                                // iteration of series data
                            }

                            // draw activiy markers
                            // TODO: call function
                            markerData = svg.selectAll('circle').data(actionItems);

                            marker = markerData
                                .enter()
                                .append('g')
                                .attr('transform', function (d) {
                                    if (d.overlapFlag) {
                                        return 'translate(' + _config.xScale(d.date) + ',' +
                                            (_config.yScale(d.values) + 20) + ')';
                                    }

                                    return 'translate(' + _config.xScale(d.date) + ',' +
                                        _config.yScale(d.values) + ')';
                                })
                                .style('cursor', 'pointer');

                            markerBorder = marker
                                .append('circle')
                                .attr('class', 'marker_1')
                                .attr('stroke', function (d) {
                                    return (d.defaultGrey === false || d.make_external === false ) ?
                                        '#777' : '#0072bc';
                                })
                                .attr('data-pos-x', function (d) {
                                    return _config.xScale(d.date);
                                })
                                .attr('data-pos-y', function (d) {
                                    if (d.overlapFlag) {
                                        return (_config.yScale(d.values) + 20);
                                    }

                                    return _config.yScale(d.values);
                                })
                                .attr('stroke-width', '2.5')
                                .attr('fill', function () {
                                    return '#fff';
                                })
                                .attr('r', function () {
                                    return 9;
                                })

                                // data properties
                                .attr('id', function (d) {
                                    return d.id || 'NA';
                                })
                                .attr('kpiType', function (d) {
                                    return d.kpiType || 'NA';
                                })
                                .attr('kpiValue', function (d) {
                                    return d.kpiValue || 'NA';
                                })
                                .attr('comment', function (d) {
                                    return d.comment || 'NA';
                                })
                                .attr('id_list', function (d) {
                                    return d.id_list;
                                })
                                .attr('activityCount', function (d) {
                                    return d.activityCount;
                                })
                                .attr('number_of_activity', function (d) {
                                    return d.activityCount;
                                })
                                .attr('number_of_activity', function (d) {
                                    return d.activityCount;
                                })
                                .attr('circle_slno', function (d) {
                                    return d.circleSLNo;
                                });

                            marker
                                .append('text')
                                .attr('dx', function (d) {
                                    if (d.activityCount > 9) {
                                        return -6;
                                    } else {
                                        return -4;
                                    }
                                })
                                .attr('dy', function (d) {
                                    if (d.activityCount > 99) {
                                        return 3;
                                    } else if (d.activityCount > 9) {
                                        return 4;
                                    } else {
                                        return 4;
                                    }
                                })
                                .style('font-size', function (d) {
                                    if (d.activityCount > 99) {
                                        return '8px';
                                    } else if (d.activityCount > 9) {
                                        return '10px';
                                    } else {
                                        return '12px';
                                    }
                                })
                                .style('fill', function (d) {
                                    return (d.activityCount > 1 ) ? '#000' : 'transparent';
                                })
                                .text(function (d) {
                                    return getActivityCountLabel(d.activityCount);
                                })
                                .attr('data-pos-x', function (d) {
                                    return _config.xScale(d.date);
                                })
                                .attr('data-pos-y', function (d) {
                                    if (d.overlapFlag) {
                                        return (_config.yScale(d.values) + 20);
                                    }

                                    return _config.yScale(d.values);
                                })

                                // data properties
                                .attr('id', function (d) {
                                    return 't' + d.id || 'NA';
                                })
                                .attr('flagId', function (d) {
                                    return d.flagId || 'NA';
                                })
                                .attr('circle_slno', function (d) {
                                    return d.circleSLNo;
                                })
                                .attr('applyColor', function (d) {
                                    return (d.activityCount > 1 ) ? 1 : 0;
                                });

                            marker.on('click', function (d) {
                                chartClick(d, defaultGrey);
                            }).on('mouseover', function (d) {
                                chartMouseOver(d, _config, this);
                            }).on('mouseout', function (d) {
                                chartMouseOut(d, _config, this);
                            });
                        }
                    },

                    drawAxis: function () {
                        var _config = this.lineChartConfig,
                            svg = d3.select(_config.rawSvg[0]),
                            height = _config.height,
                            adjustment = 10,
                            xTicks;

                        if (_config.isPerformanceChart) {
                            adjustment = 30;
                        }

                        xTicks = svg
                            .append('svg:g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(' + adjustment + ',' + height + ')')
                            .call(_config.xAxisGen);

                        if (_config.isPerformanceChart) {
                            xTicks
                                // select all the x tick texts #909BAB
                                .selectAll('.x .tick text')
                                .call(function (t) {
                                    // for each one
                                    t.each(function () {
                                        var self = d3.select(this),

                                            // get the text and split it
                                            s = self.text().split(' ');

                                        // clear it out
                                        self.text('');

                                        // insert two tspans
                                        self
                                            .append('tspan')
                                            .attr('x', 0)
                                            .attr('dy', '1em')
                                            .text((s[0] !== '') ? s[0] : s[1]);

                                        self
                                            .append('tspan')
                                            .attr('x', 0)
                                            .attr('dy', '1.1em')
                                            .text((s[0] !== '') ? s[1] : s[2]);
                                    });
                                });
                        } else {
                            xTicks
                                .selectAll('.x .tick text')
                                .each(function (d, i) {
                                    // fixing tick positions
                                    var self = d3.select(this);

                                    if (i === 0) {
                                        self.attr('x', '15');
                                    }

                                    if (i === 2) {
                                        self.attr('x', '-15');
                                    }
                                });
                        }

                        svg
                            .append('svg:g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + (20 + adjustment) + ',0)')
                            .call(_config.yAxisGen);
                    },

                    setChartParameters: function () {
                        var _config = this.lineChartConfig,
                            margin = _config.margin,
                            width = _config.rawSvg.attr('width') - margin.left - margin.right,

                            // TODO: avoid removing this : -margin.top
                            height = _config.rawSvg.attr('height') - margin.bottom - margin.top,

                            that = this,
                            parseDate = d3.time.format('%Y-%m-%d').parse;

                        this.updateConfig({
                            width: width,
                            height: height
                        });

                        this.updateConfig({
                            parseDate: parseDate
                        });

                        _config.dataToPlot[0].forEach(function (d) {
                            d.date = parseDate(d.date);
                        });

                        that.createVariablesToDrawGraph(_config.dataToPlot[0]);

                        _.each(_config.dataToPlot, function (data, idx) {
                            that.drawPath(data, idx);
                        });
                    },

                    updateConfig: function (configValues) {
                        if (typeof configValues === 'object') {
                            _.extend(this.lineChartConfig, configValues);
                        }
                    },

                    findKey: function (obj, value) {
                        var key;

                        _.each(obj, function (v, k) {
                            if (v === value) {
                                key = k;
                            }
                        });

                        // if value exists return the corresponding Key else return value
                        return (key !== undefined ? key.toUpperCase() : value.toUpperCase());
                    },

                    chartDataFun: function (lineData, threshold, kpiType, chartFrom, deliveryData) {
                        var _config = this.lineChartConfig,
                            data = [],
                            goalPerDay,
                            upperPacing,
                            lowerPacing,
                            weekStart,
                            weekEnd,
                            bookedImpressions,
                            deliveryDays,
                            totalDays,
                            totalImps,
                            days,
                            i,

                            kpiMap = {
                                cpc: 'gross_ecpc',
                                cpa: 'gross_ecpa',
                                cpm: 'gross_ecpm'
                            };

                        kpiType = kpiType !== 'null' ? kpiType : 'NA';

                        if (chartFrom === 'tactics') {
                            kpiType = lineChartService.findKey(kpiMap, kpiType);
                        }

                        _config.kpiType = kpiType;

                        // for delivery as KPI
                        if (kpiType.toLowerCase() === 'impressions') {
                            if (deliveryData) {
                                bookedImpressions = deliveryData.bookedImpressions;
                                deliveryDays = deliveryData.deliveryDays;

                                // 1 week
                                weekStart = moment(deliveryData.endDate).subtract(6, 'days');

                                weekEnd = moment(deliveryData.endDate);
                                totalDays = deliveryData.totalDays;
                            }

                            goalPerDay = bookedImpressions / deliveryDays;
                            totalImps = goalPerDay * totalDays;

                            // generate pacing data from impressions
                            for (i = 0; i < lineData.length; i++) {
                                // days passed
                                days = i + 1;
                                upperPacing = (goalPerDay * (days)) + (totalImps * 0.05);
                                lowerPacing = (goalPerDay * (days)) - (totalImps * 0.05);

                                // Fixes for pacing lines going out of the chart
                                if (upperPacing < 0) {
                                    upperPacing = 0;
                                }

                                if (lowerPacing < 0) {
                                    lowerPacing = 0;
                                }

                                data.push({
                                    date: lineData[i].date,
                                    values: lineData[i].y,

                                    // (dailyPacing * (i+1)) * (1.2), //120%
                                    upperPacing: upperPacing,

                                    // (dailyPacing * (i+1)) * (0.9) //90%
                                    lowerPacing: lowerPacing
                                });
                            }
                        } else {
                            // for other kpi types
                            for (i = 0; i < lineData.length; i++) {
                                data.push({
                                    date: lineData[i].date,
                                    values: lineData[i].y
                                });
                            }
                        }

                        return data;
                    }
                };

                // All supporting functions
                kpiPrefix = function (kpiType) {
                    var kpiTypeLower = kpiType.toLowerCase();

                    return (kpiTypeLower === 'cpc' || kpiTypeLower === 'cpa' || kpiTypeLower === 'cpm') ?
                        constants.currencySymbol : '';
                };

                kpiSuffix = function (kpiType) {
                    return (kpiType.toLowerCase() === 'vtc') ? '%' : '';
                };

                // create a unique SLNO with Internal Or External flag with date actionUTC activity date
                getCircleSLNo = function (make_external, extSLNo, intSLNo, actionUTC, selectedCampaignId) {
                    var circleSLNo;

                    if (make_external === true) {
                        circleSLNo = 'extSL_' + extSLNo + '_' + actionUTC + '_' + selectedCampaignId;
                        extSLNo++;
                    } else {
                        circleSLNo = 'intSL_' + intSLNo + '_' + actionUTC + '_' + selectedCampaignId;
                        intSLNo++;
                    }

                    return {
                        circleSLNo: circleSLNo,
                        extSLNo: extSLNo,
                        intSLNo: intSLNo
                    };
                };

                getOverlapFlag = function (activityDateArray, actionUTC) {
                    var overlapFlag;

                    if (_.indexOf(activityDateArray, actionUTC) === -1) {
                        activityDateArray.push(actionUTC);
                        overlapFlag = 0;
                    } else {
                        overlapFlag = 1;
                    }

                    return {
                        overlapFlag: overlapFlag,
                        activityDateArray: activityDateArray
                    };
                };

                getActivityCountLabel = function (activityCount) {
                    var display_activityCount = '';

                    switch (true) {
                        case (activityCount > 1 && activityCount < 10) :
                            display_activityCount = ' ' + activityCount + ' ';
                            break;

                        case (activityCount >= 10 && activityCount <= 99) :
                            display_activityCount = ' ' + activityCount + ' ';
                            break;

                        case (activityCount > 99) :
                            display_activityCount = ' 99+';
                            break;

                        default:
                            display_activityCount = '';
                    }

                    return display_activityCount;
                };

                chartClick = function (that, defaultGrey) {
                    var myContainer = $('#action-container:first'),
                        actionId = that.id,
                        getIdList = that.id_list,
                        circle_slno = that.circleSLNo,
                        isActionExternal = that.make_external,
                        splitIdList = getIdList.split(','),
                        i,
                        targetId,
                        getActivityCount,
                        activityLocalStorage,
                        scrollTo;

                    $('circle').attr({fill: '#ffffff', activeStatus: 0});

                    // check and select multiple activity id
                    if (splitIdList.length > 1) {
                        for (i = 0; i < splitIdList.length; i++) {
                            targetId = splitIdList[i];

                            $('circle#' + targetId).attr({
                                fill: (  isActionExternal === false ) ? '#7e848b' : '#2c9aec',
                                activeStatus: 1
                            });
                        }
                    } else {
                        $('circle#' + actionId).attr({
                            fill: (  isActionExternal === false ) ? '#7e848b' : '#2c9aec',
                            activeStatus: 1
                        });
                    }

                    $('text[applyColor=1]').css({fill: '#000'});
                    getActivityCount = that.activityCount;

                    if (getActivityCount > 1) {
                        $('text#t' + actionId).css({fill: '#fff'});
                    }

                    activityLocalStorage = {
                        actionSelStatusFlag: isActionExternal,
                        actionSelActivityCount: getActivityCount,
                        actionSel: getIdList,
                        selectedCircleSLNo: circle_slno
                    };

                    localStorage.setItem('activityLocalStorage', JSON.stringify(activityLocalStorage));

                    if (defaultGrey) {
                        myContainer = $('.reports_section_details_container');
                        $('div[id^="actionItem_"]').removeClass('action_selected');

                        // highlight activity in reports page
                        scrollTo = $('#actionItem_' + that.id);

                        if (scrollTo.length) {
                            scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');

                            // Mulitple Activity List
                            if (splitIdList.length > 1) {
                                for (i = 0; i < splitIdList.length; i++) {
                                    targetId = splitIdList[i];
                                    myContainer.find('#actionItem_' + targetId).addClass('action_selected');

                                    // TODO: Remove commented one after the fixes
                                    /* myContainer.animate({
                                     scrollTop: scrollTo.offset().top - myContainer.offset().top +
                                      myContainer.scrollTop()
                                     });
                                     */
                                }

                                myContainer.animate({
                                    scrollTop: scrollTo.offset().top -
                                        myContainer.offset().top +
                                        myContainer.scrollTop()
                                });
                            } else {
                                // Day wise single Activity
                                myContainer
                                    .find('.action_selected')
                                    .removeClass('action_selected')
                                    .end()
                                    .find('#actionItem_' + that.id)
                                    .addClass('action_selected');

                                myContainer.animate({
                                    scrollTop: scrollTo.offset().top -
                                        myContainer.offset().top +
                                    myContainer.scrollTop()
                                });
                            }
                        }
                    } else {
                        // click to scroll and highlight activity
                        scrollTo = $('#actionItem_' + that.id);

                        if (scrollTo.length) {
                            scrollTo.siblings().removeClass('active').end().addClass('active');

                            if (splitIdList.length > 1) {
                                myContainer.find('.active').removeClass('active').end();

                                for (i = 0; i < splitIdList.length; i++) {
                                    targetId = splitIdList[i];
                                    myContainer.find('#actionItem_' + targetId).addClass('active');

                                    // TODO: Remove below commented one after fix
                                    /*myContainer.animate({
                                     scrollTop: scrollTo.offset().top - myContainer.offset().top +
                                      myContainer.scrollTop()
                                     });*/
                                }

                                myContainer.animate({
                                    scrollTop: scrollTo.offset().top -
                                        myContainer.offset().top +
                                        myContainer.scrollTop()
                                });
                            } else {
                                myContainer
                                    .find('.active')
                                    .removeClass('active')
                                    .end()
                                    .find('#actionItem_' + that.id)
                                    .addClass('active');

                                myContainer.animate({
                                    scrollTop: scrollTo.offset().top -
                                        myContainer.offset().top +
                                        myContainer.scrollTop()
                                });
                            }
                        }
                    }
                };

                wordwrap = function (str) {
                    var m = ((arguments.length >= 2) ? arguments[1] : 75),
                        b = ((arguments.length >= 3) ? arguments[2] : '\n'),
                        c = ((arguments.length >= 4) ? arguments[3] : false),
                        i,
                        j,
                        l,
                        r,
                        s;

                    str += '';

                    if (m < 1) {
                        return str;
                    }

                    for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
                        for (s = r[i], r[i] = '';
                             s.length > m;
                             r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
                            j = c === 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j
                                .input.length - j[0].length || c === 1 && m || j.input
                                .length + (j = s.slice(m).match(/^\S*/))[0].length;
                        }
                    }

                    return r.join('\n');
                };

                getCircleStatus = function (that) {
                    return that.circleSLNo.substr(0, 3);
                };

                chartMouseOver = function (d, _config, that) {
                    var getId = d.id,
                        $getId = $('#' + getId),
                        circleStroke = getCircleStatus(d) === 'ext' ? '#2c9aec' : '#7e848b',
                        activityCount = d.activityCount,
                        activeStatus = parseInt($getId.attr('activestatus')) > 0 ? 1 : 0,
                        svg,
                        mousePos,
                        xAxisValue,
                        yAxisValue,
                        formatX,
                        formatY,
                        WIDTH,
                        HEIGHT,
                        w,
                        h,
                        x,
                        y,
                        htmlComment,
                        info,
                        numberOfActivityHeader,
                        symbol,
                        suffix,
                        lineTooltip = $('.line_tooltip');

                    $getId.attr({stroke: circleStroke});

                    // Mouseover for the text need to check if activity count > 1
                    if (activityCount > 1 && activeStatus === 0) {
                        $('#t' + getId).css({color: circleStroke, fill: circleStroke});
                    }

                    svg = d3.select(_config.rawSvg[0]);
                    mousePos = d3.mouse(that);
                    yAxisValue = $getId.data('pos-y') + 20;
                    xAxisValue = $getId.data('pos-x') + 20;
                    formatY = parseFloat(d.values).toFixed(2);
                    formatX = moment(xAxisValue).format('dddd, D MMM, YYYY');

                    // calculating the plotting position
                    WIDTH = _config.width;
                    HEIGHT = _config.height;
                    w = 40;
                    h = 40;
                    x = xAxisValue + 20;
                    y = yAxisValue;

                    info = '' + d.kpiType + ': <b>' + formatY + '</b><br>';

                    numberOfActivityHeader = d.make_external === true ?
                        '<b>' + d.activityCount + '</b> ' + ' Activities' :
                        '<b>' + d.activityCount + '</b> Internal Activities';

                    symbol = kpiPrefix(d.kpiType);
                    suffix = kpiSuffix(d.kpiType);

                    htmlComment = (d.comment).toString().replace(/(?:<)/g, '&lt;');
                    htmlComment = wordwrap(htmlComment, 20, '<br/>');
                    htmlComment = htmlComment.replace(/(?:\\r\\n|\r|\\n| \\n)/g, '<br />');
                    htmlComment = info + htmlComment;

                    if (activityCount > 1) {
                        htmlComment = info + numberOfActivityHeader;
                    }

                    lineTooltip.show();
                    lineTooltip.html(htmlComment);

                    h = lineTooltip.height();
                    w = lineTooltip.width();

                    // if overflow in width
                    if ((x + w) > WIDTH) {
                        x = x - 10 - w;
                    }

                    // if overflow in height
                    if ((y + h) > HEIGHT) {
                        y = HEIGHT - h;
                    }

                    lineTooltip.css({'top': y + 'px'});
                    lineTooltip.css({'left': x + 'px'});
                };

                chartMouseOut = function (d) {
                    var getId = d.id,
                        $getId = $('#' + getId),
                        circleStroke = getCircleStatus(d) === 'ext' ? '#177ac6' : '#57606c',
                        activityCount = d.activityCount,
                        activeStatus = parseInt($getId.attr('activestatus')) > 0 ? 1 : 0,
                        display_color = activityCount === 1 ? 'transparent' : '#000';

                    $('.line_tooltip').hide();

                    if (activeStatus === 0) {
                        // Mouseout for the circle
                        $getId.attr({stroke: circleStroke});

                        // Mouseout for the Text
                        $('#t' + getId).css({color: display_color, fill: display_color});
                    } else {
                        // Mouseout for the Text
                        if (activityCount > 1) {
                            $('#t' + getId).css({color: '#fff', fill: '#fff'});
                        }
                    }
                };

                // Chart data import and launch
                dataObj = JSON.parse(attrs.chartData);
                chartCallFrom = attrs.chartLocation || null;

                // to fix firefox mozilla coloring issue for clip path tagging
                versionTag = attrs.chartTag || Math.floor(Math.random() * 10000000);

                deliveryData = dataObj.deliveryData || null;

                chartDataset = lineChartService
                    .chartDataFun(dataObj.data, dataObj.kpiValue, dataObj.kpiType, dataObj.from, deliveryData);

                performanceChart = false;

                reverseUpperPacing = [];
                pacing = [];

                if ((dataObj.kpiType).toLowerCase() === 'impressions') {
                    // create reverse line for delivery polygon
                    _.each(chartDataset, function (d) {
                        pacing.push(
                            {
                                pacing: d.lowerPacing,
                                date: d.date
                            }
                        );

                        reverseUpperPacing.push(
                            {
                                pacing: d.upperPacing,
                                date: d.date
                            }
                        );
                    });

                    reverseUpperPacing.reverse();

                    _.each(reverseUpperPacing, function (p) {
                        pacing.push(
                            {
                                pacing: p.pacing,
                                date: p.date
                            }
                        );
                    });
                }

                if (dataObj.from === 'action_performance') {
                    performanceChart = true;
                }

                lineData = {
                    json: [chartDataset],
                    reverseUpperPacing: pacing,
                    threshold: dataObj.kpiValue,
                    isPerformanceChart: performanceChart,
                    chartCallFrom: chartCallFrom,
                    versionTag: versionTag,
                    kpiType: dataObj.kpiType,

                    keys: {
                        xAxis: {
                            val: 'date',
                            ticks: 5,
                            tickValues: []
                        },

                        yAxis: {
                            val: 'values',
                            name: 'kpiType',
                            ticks: 0,
                            tickValues: []
                        }
                    },

                    margin: {
                        top: 20,
                        right: 10,
                        left: 20,
                        bottom: 10
                    },

                    showPathLabel: true,
                    showAxisLabel: false,
                    axisLabel: ['Data', 'Value']
                };

                // override chart details
                if (performanceChart) {
                    lineData.keys.yAxis.ticks = 6;
                    lineData.keys.xAxis.ticks = 7;
                    lineData.external = dataObj.showExternal;
                    lineData.defaultGrey = dataObj.defaultGrey || undefined;
                }

                if ((dataObj.kpiType).toLowerCase() === 'impressions') {
                    // disabling ticks for y axis when kpi is delivery
                    lineData.keys.yAxis.ticks = 0;
                }

                rawSvg = elem.find('svg');
                rawSvg.attr('width', attrs.width);
                rawSvg.attr('height', attrs.height);

                lineChartService.updateConfig({
                    rawSvg: rawSvg,
                    dataToPlot: lineData.json,
                    margin: lineData.margin,
                    threshold: lineData.threshold,
                    isPerformanceChart: lineData.isPerformanceChart,
                    versionTag: lineData.versionTag,
                    reverseUpperPacing: lineData.reverseUpperPacing,
                    chartCallFrom: lineData.chartCallFrom,
                    keys: lineData.keys,
                    showPathLabel: lineData.showPathLabel,
                    showAxisLabel: lineData.showAxisLabel,
                    axisLabel: lineData.axisLabel,
                    activityList: (dataObj.activityList !== undefined) ? dataObj.activityList : undefined,
                    external: lineData.external,
                    defaultGrey: lineData.defaultGrey
                });

                lineChartService.setChartParameters();
                lineChartService.drawAxis();
            }
        };
    }]);
});
