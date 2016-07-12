define(['angularAMD', 'common/services/constants_service', 'reporting/brands/brands_model', // jshint ignore:line
    'login/login_model', 'common/services/role_based_service'], function (angularAMD) {
    'use strict';

    angularAMD.service('bubbleChart', function ($rootScope,$locale, constants, brandsModel, loginModel,
                                               RoleBasedService) {
        var advertisersSvg = {},
            campaignsSvg = {},
            chartData = {},
            node = {},
            blueGradient = {},
            orangeGradient = {},
            greenGradient = {},
            greyGradient = {},
            tooltipBackgroundColor,
            colors,
            getRepString,
            dataGenerator,
            getGradient;

        function dataFormatting (root, spanId) {
            var positions =  [[75,71,70],[240,65,65],[165,165,55],[273,200,55],[60,220,55],[165,240,50]],
                formattedData = [],
                array = root,
                maxRadius =  70,
                maxBudget = (array === undefined || array[0] === undefined) ? 0 : array[0].budget,
                ratio = (maxBudget === 0) ? 0 : maxRadius / maxBudget,
                i,
                node,
                percFill,
                radius,
                computedRadius,
                pathData,
                object;

            for (i in array) {
                node = array[i];
                percFill =0;
                radius  = 0;

                if (node.budget > 0) {
                    percFill = Math.round((node.spend / node.budget) * 100);
                    radius = ((node.budget) * ratio < 30) ? 30 : ((node.budget) * ratio < 40 ?
                        (node.budget * ratio + 5): (node.budget) * ratio);
                }

                computedRadius = (radius === 0) ? 30 : (positions[i][2] < radius ? positions[i][2] : radius);
                pathData =  dataGenerator(positions[i][0], positions[i][1], computedRadius, percFill);

                object = {
                    id: i,
                    brandId: node.brand_id,
                    className: node.name,
                    value: node.budget,
                    budget:node.budget,
                    spend: node.spend,
                    percFill: percFill,
                    campaigns: node.campaigns,
                    cx: positions[i][0],
                    cy: positions[i][1],
                    r: computedRadius,
                    status: (spanId === 'advertisers') ? 'advertisers' :  node.kpi_status,
                    pathData: pathData.lineData,
                    toolTipX: pathData.curveEndX,
                    toolTipY: pathData.curveEndY,
                    objectType: (spanId === 'advertisers')? 'advertisers' : 'campaigns',
                    advertiserId: node.advertiser_id,
                    advertiserName: node.advertiser_name
                };

                formattedData.push(object);
            }

            return formattedData;
        }

        function updateBubbleChartData(spanId, data) {
            $('#advertisers').show();
            $('#campaigns').hide();
            this.spendData = data;
            createBubbleChart.call(this, spanId, this.spendData);
        }

        function createBubbleChart(spanId, data) {
            var tooltip,
                lineFunction;

            advertisersSvg = {};
            campaignsSvg = {};
            chartData = {};
            node = {};

            d3.select('#advertisers_svg').remove(); // jshint ignore:line
            d3.select('#campaigns_svg').remove(); // jshint ignore:line

            if (spanId === 'advertisers') {
                $('#advertisers').show();
                $('#campaigns').hide();

                advertisersSvg  = d3 // jshint ignore:line
                    .select('#advertisers')
                    .append('svg')
                    .attr('width', 350)
                    .attr('height', 280)
                    .attr('id',  spanId + '_svg')
                    .append('g');

                chartData =  dataFormatting(data,spanId);

                node = advertisersSvg
                    .selectAll('.node')
                    .data(chartData)
                    .enter()
                    .append('g')
                    .attr('class', 'node');

                blueGradient = getGradient(advertisersSvg, 'blueGradient', '#1F9FF4', '25%', '#1B7FE2', '75%');

                tooltip = d3 // jshint ignore:line
                    .select('.dashboard_budget_graph_holder .dashboard_perf_graph')
                    .append('div')
                    .attr('class', 'bubble_tooltip')
                    .attr('id','bubbleChartTooltip')
                    .style('position', 'absolute')
                    .style('z-index', '10')
                    .style('display', 'none')
                    .style('color', 'black')
                    .style('padding', '5px 20px')
                    .style('background-color', tooltipBackgroundColor)
                    .style('border-radius', '4px')
                    .style('-webkit-border-radius', '4px')
                    .style('-moz-border-radius', '4px')
                    .style('border', 'solid 1px #ccc')
                    .style('word-wrap', 'break-word')
                    .style('box-shadow', '0px 0px 2px #ccc')
                    .style('font', '14px Avenir')
                    .style('text-alignt','center')
                    .style('font-weight','500')
                    .style('width','200px')
                    .text('tooltip');
            } else if (spanId === 'campaigns') {
                $('#advertisers').hide();
                $('#campaigns').show();

                campaignsSvg  = d3 // jshint ignore:line
                    .select('#campaigns').append('svg')
                    .attr('width', 350)
                    .attr('height', 280)
                    .attr('id',  'campaigns_svg')
                    .append('g');

                chartData =  dataFormatting(data,spanId);

                node = campaignsSvg
                    .selectAll('.node')
                    .data(chartData).enter()
                    .append('g')
                    .attr('class', 'node');

                greenGradient = getGradient(campaignsSvg, 'greenGradient', '#59F42D', '25%', '#45D11F', '75%');
                orangeGradient =  getGradient(campaignsSvg, 'orangeGradient', '#FC8732', '30%', '#FC782A', '70%');
                greyGradient =  getGradient(campaignsSvg, 'greyGradient', '#A7ACB2', '30%', '#94989E', '70%');

                tooltip = d3 // jshint ignore:line
                    .select('.dashboard_budget_graph_holder .dashboard_perf_graph')
                    .append('div')
                    .attr('class', 'bubble_tooltip')
                    .attr('id','bubbleChartTooltip')
                    .style('position', 'absolute')
                    .style('z-index', '10')
                    .style('display', 'none')
                    .style('color', 'black')
                    .style('padding', '5px 20px')
                    .style('background-color', tooltipBackgroundColor)
                    .style('border-radius', '4px')
                    .style('-webkit-border-radius', '4px')
                    .style('-moz-border-radius', '4px')
                    .style('border', 'solid 1px #ccc')
                    .style('word-wrap', 'break-word')
                    .style('box-shadow', '0px 0px 2px #ccc')
                    .style('font', '14px Avenir')
                    .style('text-alignt','center')
                    .style('font-weight','500')
                    .style('width','300px')
                    .text('tooltip');
            }

            lineFunction = d3 // jshint ignore:line
                .svg
                .line()
                .x(function (d) {
                    return d.x ;
                })
                .y(function (d) {
                    return d.y;
                })
                .interpolate('basis-closed');

            node.append('circle')
                .attr('id', function (d) {
                    return (d.objectType === 'advertisers' ?
                        'advertisers_' + d.id + '_circle' :
                        'campaigns_' + d.id + '_circle');
                })
                .style('fill', function (d) {
                    return  (d.objectType === 'advertisers') ?
                        colors.advertisers.circleFill :
                        ((d.status.toLowerCase() === 'ontrack') ?
                            colors.campaigns.onTrack.circleFill :
                            (d.status.toLowerCase() === 'underperforming') ?
                                colors.campaigns.underPerforming.circleFill :
                                colors.campaigns.others.circleFill
                        );
                })
                .attr('r', function (d) {
                    return d.r;
                })
                .attr('cx', function (d) {
                    return d.cx;})
                .attr('cy', function (d) {return d.cy;});

            node.append('path')
                .attr('id', function(d){
                    return (d.objectType === 'advertisers') ?
                        'advertisers_' +  d.id +'_path' :
                        'campaigns_' +  d.id +'_path';
                })
                .attr('d', function (d) {
                    return lineFunction(d.pathData);
                })
                .attr('fill',  function (d) {
                    return  (d.objectType === 'advertisers') ?
                        colors.advertisers.spendFillLight :
                        ((d.status.toLowerCase() === 'ontrack') ?
                            colors.campaigns.onTrack.spendFillLight :
                            (( d.status.toLowerCase() === 'underperforming') ?
                                colors.campaigns.underPerforming.spendFillLight :
                                colors.campaigns.others.spendFillLight
                            )
                        );
                });

            node.append('text') //For brand name
                .attr('transform', function (d) {
                    if (d.r > 60) {
                        return 'translate(' + d.cx + ',' + (d.cy+35) + ')';
                    } else if (d.r > 50) {
                        return 'translate(' + d.cx + ',' + (d.cy+30) + ')';
                    } else if (d.r >40) {
                        return 'translate(' + d.cx + ',' + (d.cy+20) + ')';
                    } else if (d.r >35) {
                        return 'translate(' + d.cx + ',' + (d.cy+15) + ')';
                    } else {
                        return  'translate(' + d.cx + ',' + (d.cy) + ')';
                    }
                })
                .attr('font-family','Avenir')
                .style('font-weight','500')
                .style('z-index', '10')
                .style('font-size', function (d) {
                    var size;

                    if (d.r > 50) {
                        size = '12px';
                    } else if (d.r > 40) {
                        size = '10px';
                    } else {
                        size = '8px';
                    }

                    return size;
                })
                .style('text-anchor', 'middle')
                .attr('fill', 'white')
                .text(function (d) {
                    var text;

                    if (d.r > 60) {
                        text = (d.className.length > 12) ?
                            d.className.substring(0, 12) + '...' :
                            d.className.substring(0, 12);
                    } else if (d.r >55) {
                        text = (d.className.length > 10) ?
                            d.className.substring(0, 10) + '...' :
                            d.className.substring(0, 10);
                    } else if (d.r > 50) {
                        text = (d.className.length > 8) ?
                            d.className.substring(0, 8) + '...' :
                            d.className.substring(0, 8);
                    } else if (d.r > 40) {
                        text = (d.className.length > 6) ?
                            d.className.substring(0, 6) + '...' :
                            d.className.substring(0, 6);
                    }

                    return text;
                });

            node
                // for brand budget
                .append('text')
                .attr('transform', function (d) {
                    if (d.r > 50) {
                        return 'translate(' + d.cx + ',' + (d.cy+10) + ')';
                    } else if (d.r > 40) {
                        return 'translate(' + d.cx + ',' + (d.cy+2) + ')';
                    } else {
                        return 'translate(' + d.cx + ',' + (d.cy+5) + ')';
                    }
                })
                .attr('font-family','Avenir')
                .style('text-anchor', 'middle')
                .attr('fill', 'white')
                .style('z-index', '10')
                .attr('font-size', function (d) {
                    var textSize;

                    if (d.r > 55) {
                        textSize = '26px';
                    } else if (d.r > 45) {
                        textSize = '22px';
                    } else if (d.r > 35) {
                        textSize = '20px';
                    } else if (d.r > 30) {
                        textSize = '18px';
                    } else {
                        textSize='14px';
                    }

                    return textSize;
                })
                .attr('font-weight','500')
                .attr('fill', 'white')
                .style('text-anchor', 'middle')
                .text(function (d) {
                    var budget;

                    if (d.r > 25) {
                        budget = getRepString(d.budget, d.r);
                    }

                    return budget;
                });

            node.on('mouseover', function (obj) {
                var focusedObjId,

                    focused_obj = {
                    name: obj.className,
                    id: obj.id,
                    cx: obj.cx,
                    cy: obj.cy,
                    percFill: obj.percFill,
                    spend: obj.spend,
                    budget: obj.budget,
                    r: obj.r,
                    objectType: obj.objectType,
                    status: obj.status,
                    toolTipX: (obj.toolTipX === undefined) ?(obj.cx + obj.r): obj.toolTipX,
                    toolTipY: (obj.toolTipY === undefined) ? (obj.cy+ obj.r) : obj.toolTipY
                };

                node.selectAll('circle').attr('opacity',0.4);
                node.selectAll('path').attr('opacity', 0.4);

                focusedObjId = (focused_obj.objectType === 'advertisers') ?
                    'advertisers_'+focused_obj.id :
                    'campaigns_'+focused_obj.id;

                d3.select('#'+focusedObjId + '_circle').attr('opacity', 1); // jshint ignore:line
                d3.select('#'+focusedObjId + '_path').attr('opacity', 1); // jshint ignore:line

                d3 // jshint ignore:line
                    .select('#'+ focusedObjId + '_path')
                    .attr('id', focusedObjId + '_path')
                    .attr('opacity', 1)
                    .attr('stroke', (focused_obj.objectType === 'advertisers') ?
                        colors.advertisers.spendPathOutline :
                        (focused_obj.status.toLowerCase() === 'ontrack' ?
                            colors.campaigns.onTrack.spendPathOutline :
                            (focused_obj.status.toLowerCase() === 'underperforming' ?
                                colors.campaigns.underPerforming.spendPathOutline :
                                colors.campaigns.others.spendPathOutline
                            )
                        )
                    )
                    .attr('stroke-width', 3)
                    .attr('fill', (focused_obj.objectType === 'advertisers') ?
                        colors.advertisers.spendFillLight : (focused_obj.status.toLowerCase() === 'ontrack' ?
                        colors.campaigns.onTrack.spendFillLight :
                        (focused_obj.status.toLowerCase() === 'underperforming' ?
                            colors.campaigns.underPerforming.spendFillLight
                            : colors.campaigns.others.spendFillLight
                        ))
                    );

                return tooltip
                    .html(focused_obj.name +
                        '<br/><b style="display: inline-block; width: 55px;">Budget:</b>' +
                        constants.currencySymbol +
                        focused_obj.budget.toFixed(2).replace(/./g, function (c, i, a) {
                            return i && c !== '.' && ((a.length - i) % 3 === 0) ? ',' + c : c;
                        }) +
                        '<br/><b style="display: inline-block; width: 55px;">Spend:</b>' +
                        constants.currencySymbol +
                        focused_obj.spend.toFixed(2).replace(/./g, function (c, i, a) {
                            return i && c !== '.' && ((a.length - i) % 3 === 0) ? ',' + c : c;
                        }))
                    .style('display', 'block')
                    .style('top', function () {
                        var tooltipHeight = $('div.bubble_tooltip:visible').height();

                        return (focused_obj.cy - (tooltipHeight/2) + 50)+'px';
                    })
                    .style('left',  (focused_obj.toolTipX + 14) +'px');
            });

            node.on('mouseout', function (obj) {
                var idToRemove,

                    focused_obj = {
                        name : obj.className,
                        id : obj.id,
                        cx : obj.cx,
                        cy : obj.cy,
                        percFill : obj.percFill,
                        spend : obj.spend,
                        r : obj.r,
                        objectType : obj.objectType,
                        status : obj.status,
                        toolTipX : obj.toolTipX,
                        toolTipY : obj.toolTipY
                    },

                    focusedObjId = (focused_obj.objectType === 'advertisers') ?
                        'advertisers_'+focused_obj.id :
                        'campaigns_'+focused_obj.id;

                node.selectAll('circle').attr('opacity',1);
                node.selectAll('path').attr('opacity', 1);

                idToRemove = focusedObjId + '_path';

                d3 // jshint ignore:line
                    .select('#'+ idToRemove)
                    .attr('opacity', 1)
                    .attr('stroke', (focused_obj.objectType === 'advertisers') ?
                        colors.advertisers.spendFillLight : (focused_obj.status.toLowerCase() === 'ontrack' ?
                        colors.campaigns.onTrack.spendFillLight :
                        (focused_obj.status.toLowerCase() === 'underperforming' ?
                            colors.campaigns.underPerforming.spendFillLight  :
                            colors.campaigns.others.spendFillLight))
                    )
                    .attr('stroke-width', 0.2)
                    .attr('fill', (focused_obj.objectType === 'advertisers') ?
                        colors.advertisers.spendFillLight : (focused_obj.status.toLowerCase() === 'ontrack' ?
                        colors.campaigns.onTrack.spendFillLight :
                        (focused_obj.status.toLowerCase() === 'underperforming' ?
                            colors.campaigns.underPerforming.spendFillLight :
                            colors.campaigns.others.spendFillLight
                        ))
                    );

                return  tooltip.style('display', 'none');
            });

            node.on('click', function (obj) {
                if (obj.objectType === 'advertisers') {
                    tooltip.style('display', 'none');
                    d3.select('#advertisers_svg').empty(); // jshint ignore:line
                    d3.select('#campaigns_svg').empty(); // jshint ignore:line
                    $rootScope.$broadcast(constants.BUBBLE_ADVERTISER_CLICKED, obj);
                }
            });
        }

        RoleBasedService.setCurrencySymbol();

        tooltipBackgroundColor = '#FEFFFE';

        colors = {
            advertisers: {
                circleFill: '#0F62BC',
                spendFillLight: 'url(#blueGradient)',
                spendPathOutline: '#085f9f'
            },

            campaigns: {
                onTrack: {
                    circleFill: '#56D431',
                    spendFillLight: 'url(#greenGradient)',
                    spendPathOutline: '#379B1C'
                },

                underPerforming: {
                    circleFill: '#F1661F',
                    spendFillLight: 'url(#orangeGradient)',
                    spendPathOutline: '#DB530F'
                },

                others: {
                    circleFill: '#808B9C',
                    spendFillLight: 'url(#greyGradient)',
                    spendPathOutline: '#555D6B'
                }
            }
        };

        getRepString = function (x, r) {
            var y = Math.abs(x);

            if (y < 999) {
                return  constants.currencySymbol + ((r > 55) ? x.toFixed(2) : x.toFixed(0));
            }

            if (y < 9999) {
                x = x / 1000;

                return  constants.currencySymbol + ((r > 55) ? x.toFixed(2)  : x.toFixed(0))+ 'K';
            }

            if (y < 1000000) {
                x = x / 1000;

                return constants.currencySymbol + ((r > 55) ? x.toFixed(2) : x.toFixed(0)) + 'K';
            }

            if (y < 10000000) {
                x = x / 1000000;

                return constants.currencySymbol + ((r > 55) ? x.toFixed(2)  : x.toFixed(0)) + 'M';
            }

            if (y < 1000000000) {
                x = x / 1000000;

                return constants.currencySymbol +  ((r > 55) ? x.toFixed(2)  : x.toFixed(0)) + 'M';
            }

            if (y < 1000000000000) {
                x = x / 1000000000;
                return constants.currencySymbol +  ((r > 55) ? x.toFixed(2)  : x.toFixed(0)) + 'B';
            }

            return '1T+';
        };

        dataGenerator = function (x, y, r, perc) {
            var lineData = [],
                yCurviness,
                angle,
                startAngle,
                middle,
                firstMiddle,
                secondMiddle,
                xStart,
                xEnd,
                yStart,
                newCoordinates;

            if (r > 0) {
                if (perc < 99) {
                    // To set curviness of the circle filling 1st criteria is r
                    yCurviness = 8;

                    if (r < 10) {
                        yCurviness = 0;
                    }

                    if (r < 18) {
                        yCurviness = 3;
                    }

                    if (r < 30) {
                        yCurviness = 5;
                    } else if (r < 50) {
                        yCurviness = 8;
                    } else if (r < 60) {
                        yCurviness =10;
                    }

                    // To set curviness 2nd criteria is percentage fill
                    if (perc >90) {
                        yCurviness =3;
                    }

                    startAngle = Math.atan(1 - perc/50);

                    for (angle = startAngle; angle < (Math.PI - startAngle); angle = angle +((Math.PI) / 180 * 4)) {
                        newCoordinates = {
                            x: x - r * Math.cos(angle),
                            y: y + r * Math.sin(angle)
                        };

                        lineData.push(newCoordinates);
                    }

                    xStart = lineData[0].x;
                    yStart = lineData[0].y;
                    xEnd = lineData[lineData.length -1].x;

                    middle = {
                        x: xStart + (xEnd - xStart)/2,
                        y: yStart
                    };

                    firstMiddle = {
                        x: xStart + (middle.x - xStart) /2,
                        y: middle.y + yCurviness
                    };

                    secondMiddle = {
                        x:  middle.x + (xEnd - middle.x) / 2,
                        y: middle.y - yCurviness
                    };

                    lineData.push(secondMiddle);
                    lineData.push(middle);
                    lineData.push(firstMiddle);
                    lineData.push(lineData[0]);
                } else {
                    for (angle = 0; angle < (2 * Math.PI); angle = angle +((Math.PI) / 180 * 8)) {
                        newCoordinates = {
                            x: x - r * Math.cos(angle),
                            y: y + r * Math.sin(angle)
                        };

                        lineData.push(newCoordinates);
                    }

                    xEnd = x + r;
                    yStart = y;
                }
            }

            return {
                lineData : lineData,
                curveEndX : xEnd,
                curveEndY : yStart
            };
        };

        getGradient = function (container, id, lightColor, offsetLight, darkColor, offsetDartk) {
            id = container
                .append('svg:defs')
                .append('svg:linearGradient')
                .attr('id', id)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%')
                .attr('spreadMethod', 'pad');

            id
                .append('svg:stop')
                .attr('offset', offsetLight)
                .attr('stop-color', lightColor)
                .attr('stop-opacity', 1);

            id
                .append('svg:stop')
                .attr('offset', offsetDartk)
                .attr('stop-color',  darkColor)
                .attr('stop-opacity', 1);

            return id;
        };

        this.updateBubbleChartData = updateBubbleChartData;

        this.cleaningBubbleChart = function (spanId) {
            d3.select('#'+spanId+'_svg').remove(); // jshint ignore:line
            $('#data_not_available').hide();
        };
    });
});
