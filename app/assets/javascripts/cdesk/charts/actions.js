/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("actionChart", function($timeout, actionColors) {
        var kpiPrefix = function (kpiType) {
            var kpiTypeLower = kpiType.toLowerCase();
            return (kpiTypeLower == 'cpc' || kpiTypeLower == 'cpa' || kpiTypeLower == 'cpm') ? '$' : ''
        }
        var drawMarker = function (chart, xPos, yPos, markerColor, kpiType, kpiValue, actionId, actionComment, isActionExternal, defaultGrey) {

            var text, textBG, marker, container;

            marker = chart.renderer.text('E',xPos-2,yPos+2).attr({
                id: 't'+actionId || 'NA',
                zIndex: 5
            }).css({
                fontWeight: 'bold',
                fontSize: '9px',
                color: (defaultGrey || isActionExternal==false) ? 'transparent' :'white',
                cursor: 'pointer'
            }).on('click', function (markerObj) {
                //console.log(markerObj.target.id);
                $('#'+actionId).click();
            }).on('mouseover', function (e) {
                //$('#'+actionId).trigger('mouseover',this);
            }).on('mouseout', function (e) {
                //$('#'+actionId).trigger('mouseout',this);
            }).add(),
            container = marker.getBBox();

            chart.renderer.circle(container.x+3 , container.y+5,7).attr({
                fill: (defaultGrey) ? 'white' : '#0072bc' || 'white',
                stroke: (defaultGrey) ? 'grey' : '#0072bc' || 'grey',
                'stroke-width': 4,
                id: actionId || 'NA',
                kpiType: kpiType || 'NA',
                kpiValue: kpiValue || 'NA',
                comment: actionComment || 'NA',
                zIndex: 4
            })


            //full customisation for flags/markers
            /*chart.renderer.circle(xPos, yPos, 7).attr({
                fill: '#ffffff',
                stroke: (defaultGrey) ? 'grey' : '#0072bc' || 'grey',
                'stroke-width': 4,
                id: actionId || 'NA',
                kpiType: kpiType || 'NA',
                kpiValue: kpiValue || 'NA',
                comment: actionComment || 'NA',
                zIndex: 3
            })*/.css({
                cursor: 'pointer'
            }).on('mouseover', function (event) {
                chart.tooltip.hide();
                var x = event.offsetX;
                var y = event.offsetY;
                var correctionX = 0;
                var symbol = '';
                if ((chart.plotWidth - x) < 0) {
                    //check if left side
                    correctionX = (chart.plotWidth - x) * 2 - 10;
                }
                symbol = kpiPrefix(kpiType);
                text = chart.renderer.text(this.getAttribute('kpiType') + ": <b>" + symbol + this.getAttribute('kpiValue') + "</b><br>" + this.getAttribute('comment'), x + 10 + correctionX, y + 10 * 2)
                    .attr({
                    zIndex: 16
                }).css({
                    fillColor: '#fff',
                    color: '#000'
                }).add();
                var box = text.getBBox();
                textBG = chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
                    .attr({
                    fill: '#ffffff',
                    stroke: '#0072bc' || 'grey',
                        'stroke-width': 1,
                    zIndex: 15
                }).add();
            }).on('mouseout', function (event) {
                text.destroy();
                textBG.destroy();
            }).on('click', function (circleObj) {
                var myContainer = $('#action-container:first');
                if(defaultGrey) {
                    $('circle').attr({stroke: 'grey', fill:'#ffffff'});
                    $('circle#' + circleObj.target.id).attr({stroke: 'green', fill:'green'});
                    $('text#t' + circleObj.target.id).css({fill:'transparent'});

                    var myContainer = $('.reports_section_details_container');
                }
                //click and scroll action functionality

                var scrollTo = $('#actionItem_' + this.id);
                localStorage.setItem('actionSel' , this.id);
                if(scrollTo.length) {
                    //scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
                    myContainer.find('.active').removeClass('active').end().find('#actionItem_'+this.id).addClass('active');

                    myContainer.animate({
                        scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });
                }
            }).add();
        };
        var lineChart = function(lineData, threshold, kpiType, actionItems, width, height, defaultGrey, orderId, external) {
            var data = [];
            for (var i = 0; i < lineData.length; i++) {
                var chartData = lineData[i]['date'].split("-");
                data.push([
                    Date.UTC(parseInt(chartData[0]), parseInt(chartData[1], 10) - 1 , parseInt(chartData[2])),
                    lineData[i]['y'] 
                ]);
            }
            var dataLength = data.length;
            var timeInterval = dataLength/7;
            
            return {
                options: {
                    chart: {
                        width: width ? width: 400,
                        height: height ? height : 330,
                        margin: [20, 0, 50, 60]
                    },
                    title: {
                        text: '',
                        style: {
                            "color": "#ffffff"
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: [{
                        type: 'datetime',
                        maxPadding:0,
                        minPadding:0,
                        tickWidth: 0,
                        labels: {
                            formatter: function() {
                                if(this.isFirst) {
                                      return Highcharts.dateFormat('%e', this.value);
                                } else {
                                      return Highcharts.dateFormat('%e', this.value);
                                }
                            }
                        },
                        tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
                    },
                    {
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        lineColor: 'transparent',
                        minorTickLength: 0,
                        tickLength: 0,
                        tickWidth: 0,
                        type: 'datetime',
                        labels: {
                            formatter: function() {
                                return Highcharts.dateFormat('%b', this.value);
                            }
                        },
                        tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
                    }],
                    yAxis: {
                        maxPadding:0,
                        minPadding:0,
                        title: {
                            align: 'high',
                            offset: 13,
                            text: kpiType,
                            rotation: 0,
                            y: -5
                        },
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        lineWidth: 1,
                        tickWidth: 0,
                        labels: {
                            formatter: function() {
                                return kpiPrefix(kpiType) + this.value;
                            }
                        },
                        plotBands: [{ // Light air
                            color: '#fbdbd1',
                            label: {
                                enabled: false,
                                text: '',
                                style: {
                                    color: 'red'
                                }
                            }
                        }],
                        plotLines: [{
                            label: {
                                text: 'Baseline',
                                x: 25
                            },
                            color: 'orange',
                            width: 0,
                            value: threshold, 
                            dashStyle: 'longdashdot'
                        }]
                    },
                    tooltip: {
                        crosshairs: [{
                            dashStyle: 'dash'
                        }/*,
                        {
                            dashStyle: 'dash'
                        }*/],
                        enabled: true,
                        formatter: function() {
                            var symbol = kpiPrefix(kpiType);
                            if (typeof(this.point.options.note) === 'undefined') {
                                return this.series.name + ':' + ' <b>'+ symbol + this.point.y + '</b><br/>';
                            } else {
                                return this.series.name + ':' + ' <b>' + symbol + this.point.y + '<br>' + this.point.options.note.text + '</b><br/>';
                            }
                        }
                    },
                },
                series: [{
                    id: 'series-1',
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    name: kpiType,

                    data: data,
                    color: "#00bff0" /*#6fd0f4"*/
                }],
                loading: false,
                func: function(chart) {
                    $timeout(function() {
                        var counter = 0, flag = [], position = 0, showExternal;

                        //override for redzone test
                        //kpiType = "clicks";
                        //threshold = 100;

                        //red zone calculations
                        if(chart !== undefined) {


                            var extremesX = chart.xAxis[0].getExtremes();
                            chart.xAxis[1].setExtremes(extremesX.min - 0.5, extremesX.max + 0.5);
                            var extremes = chart.yAxis[0].getExtremes();

                            if (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') {
                                if (extremes.max <= threshold) {
                                    //check if threshold outside chart (red zone is from above the threshold to max value (that is regenerated if outside graph))
                                    chart.yAxis[0].setExtremes(0, extremes.max + (threshold - extremes.max) + 0.5);
                                }
                            } else {
                                //for kpi types - clicks, impressions etc (redzone is from threshold to zero)
                                if (extremes.max < threshold) {
                                    //check if threshold outside chart
                                    chart.yAxis[0].setExtremes(0, extremes.max + (threshold - extremes.max));
                                }
                            }

                            //plotting red zone
                            extremes = chart.yAxis[0].getExtremes();
                            chart.yAxis[0].addPlotBand({ // Light air
                                from: threshold,
                                to: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? extremes.max : extremes.min,
                                color: '#fbdbd1',
                                label: {
                                    enabled: false,
                                    text: '',
                                    style: {
                                        color: 'red'
                                    }
                                }
                            });

                            //rendering threshold marker image in y-axis
                            var renderPos;
                            if (threshold <= chart.yAxis[0].max && threshold >= chart.yAxis[0].min) {
                                chart.renderer.image(assets.target_marker, 0, chart.yAxis[0].toPixels(threshold) - chart.plotTop / 2, 17, 17).add();
                            }

                            //rendering action markers after red zone manipulation
                            if (external != undefined && external == true) {
                                //filter applied
                                showExternal = true;
                            }

                            if (actionItems) {
                                for (i = chart.series[0].data.length - 1; i >= 0; i--) {
                                    position = 0;
                                    for (var j = actionItems.length - 1; j >= 0; j--) {
                                        var dateUTC = new Date(actionItems[j].created_at);
                                        //example. actionItems[1].created_at  1396396800000 converted to UTC 1413459349308;
                                        var actionUTC = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
                                        if (chart.series[0].data[i].x == actionUTC) {
                                            if (flag[actionUTC] === undefined) {
                                                flag[actionUTC] = 1;
                                            }
                                            if ((showExternal && actionItems[j].make_external == true) || (showExternal === undefined)) {
                                                //showing markers based on filter type
                                                drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, threshold, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment, actionItems[j].make_external, defaultGrey);
                                                counter++;
                                                position += 10; //correction for multiple markers in the same place
                                            }

                                        }
                                    }
                                }
                            }
                            if (orderId !== undefined) {
                                //var id = orderId.action.ad_id+''+orderId.action.id;
                                //$('circle#' +id).attr({stroke: 'green', fill:'green'});
                                $('circle#' + orderId).attr({stroke: 'green', fill: 'green'});
                            }
                        }

                    }, 1000);
                }
            }
        };
        return {
            lineChart: lineChart
        };
    });
}());