/*global angObj, angular*/
(function() {
    "use strict";
    angObj.factory("actionChart", function($timeout, actionColors) {
        var drawMarker = function (chart, xPos, yPos, markerColor, kpiType, kpiValue, actionId, actionComment) {
            var text, textBG;
            //full customisation for flags/markers
            chart.renderer.circle(xPos, yPos, 7).attr({
                fill: '#ffffff',
                stroke: markerColor || 'grey',
                'stroke-width': 4,
                id: actionId || 'NA',
                kpiType: kpiType || 'NA',
                kpiValue: kpiValue || 'NA',
                comment: actionComment || 'NA',
                zIndex: 3
            }).css({
                cursor: 'pointer'
            }).on('mouseover', function (event) {
                chart.tooltip.hide();
                var x = event.offsetX;
                var y = event.offsetY;
                var correctionX = 0;
                if ((chart.plotWidth - x) < 0) {
                    //check if left side
                    correctionX = (chart.plotWidth - x) * 2 - 10;
                }
                text = chart.renderer.text(this.getAttribute('kpiType') + ": <b>$" + this.getAttribute('kpiValue') + "</b><br>" + this.getAttribute('comment'), x + 10 + correctionX, y + 10 * 2)
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
                    stroke: markerColor || 'grey',
                        'stroke-width': 1,
                    zIndex: 15
                }).add();
            }).on('mouseout', function (event) {
                text.destroy();
                textBG.destroy();
            }).on('click', function () {
                //click and scroll action functionality
                var myContainer = $('#action-container:first');
                var scrollTo = $('#actionItem_' + this.id);
                scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
                myContainer.animate({
                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                });
            }).add();
        };
        var lineChart = function(lineData, threshold, kpiType, actionItems) {
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
                        width: 500,
                        height: 330,
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
                                return '$' + this.value;
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
                        },
                        {
                            dashStyle: 'dash'
                        }],
                        enabled: true,
                        formatter: function() {
                            if (typeof(this.point.options.note) === 'undefined') {
                                return this.series.name + ':' + ' <b> $' + this.point.y + '</b><br/>';
                            } else {
                                return this.series.name + ':' + ' <b> $' + this.point.y + '<br>' + this.point.options.note.text + '</b><br/>';
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
                    color: "#6fd0f4"
                }],
                loading: false,
                func: function(chart) {
                    //drawMarker(chart, 200,280,null,965192010);
                    /*chart.renderer.image('/assets/cdesk/icn_goal.png', 0, 100, 17, 17).add();      */
                    $timeout(function() {
                        var counter = 0, flag = [], position = 0 ;
                        if(actionItems) {
                            for(i = chart.series[0].data.length-1; i >= 0; i--) {
                                position = 0;
                                for(var j = actionItems.length-1; j >= 0 ; j--) {
                                    var dateUTC = new Date(actionItems[j].created_at);
                                    var actionUTC = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
                                    if(chart.series[0].data[i].x == actionUTC){
                                        if(flag[actionUTC] === undefined){
                                            flag[actionUTC] = 1;
                                        }else{
                                            position += 10;
                                        }
                                        drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, threshold, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment);
                                        console.log('id:'+actionItems[j].ad_id + '' + actionItems[j].id);
                                        counter++;
                                    }
                                }
                            }
                        }
                        var extremesX = chart.xAxis[0].getExtremes();
                        chart.xAxis[1].setExtremes(extremesX.min - 0.5 , extremesX.max + 0.5);
                        var extremes = chart.yAxis[0].getExtremes();
                        chart.yAxis[0].addPlotBand({ // Light air
                            from: threshold, 
                            to: (kpiType == 'CPC' || kpiType == 'CPA' || kpiType == 'CPM') ? extremes.max : extremes.min,
                            color: '#fbdbd1',
                            label: {
                                enabled: false,
                                text: '',
                                style: {
                                    color: 'red'
                                }
                            }
                        });
                    }, 1000);
                }
            }
        };
        return {
            lineChart: lineChart
        };
    });
}());