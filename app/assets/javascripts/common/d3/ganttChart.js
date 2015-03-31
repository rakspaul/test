(function() {
    "use strict";
    commonModule.service("ganttChart", function(loginModel, analytics) {
        this.createGanttChart = function() {

        };

        var MIN_CALENDAR_HEIGHT = 500;

        d3.gantt = function(cal_height) {
            var FIT_TIME_DOMAIN_MODE = "fit";
            var FIXED_TIME_DOMAIN_MODE = "fixed";
            var CAMPAIGN_HEIGHT = 25;

            var CALENDAR_HEIGHT = (cal_height === undefined) ? MIN_CALENDAR_HEIGHT : cal_height;

            var CALENDAR_WIDTH = 1084;

            var isSingleBrand = false;

            var margin = {
                top: 20,
                right: 40,
                bottom: 20,
                left: 50
            };

            var onTrackColor = "#47ab1d";
            var underperformingColor = "#ee9455";
            var noStatusColor = "#939eae";
            var timeDomainStart = d3.time.day.offset(new Date(), -300);
            var timeDomainEnd = d3.time.hour.offset(new Date(), +300);
            var timeDomainMode = FIT_TIME_DOMAIN_MODE; // fixed or fit
            var taskTypes = [];
            var taskStatus = [];
            var height = CALENDAR_HEIGHT - margin.top - margin.bottom - 5;
            var width = CALENDAR_WIDTH - margin.right - margin.left - 5;

            //for drag and panning
            var selection = selection || d3.select("body");

            var tickFormat = "%d"; //%b


            var keyFunction = function(d) {
                return d.startDate + d.taskName + d.endDate;
            };

            var rectTransform = function(d) {
                return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
            };

            var markerTransform = function() {
                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                if (width <= 40) {
                    return "translate(" + x(moment().endOf('day')) + ",-20)";
                }
                return "translate(" + x(moment().startOf('day')) + ",-20)";
            };

            var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
            var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, 450]);
            //TO DO - add scroll
            //d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);

            var xAxis = d3.svg.axis()
                .scale(x).orient("top")
                .tickFormat(function(d) {

                    count++;
                    console.log(d);
                    if (count == 1) {
                        return formatMonth(d);
                    } else {
                        return formatDay(d);
                    }


                    //if first - show date and month, 
                    //if 1st day of month - show month, day
                    //if other views - quarter, year, month 
                    //year - show month - year for 1st

                })
                .ticks(d3.time.days, 1)
                .tickSize(height - margin.top, height - margin.top)
                .tickPadding(-15);

            var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

            var initTimeDomain = function(tasks) {
                if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
                    if (tasks === undefined || tasks.length < 1) {
                        timeDomainStart = d3.time.day.offset(new Date(), -3);
                        timeDomainEnd = d3.time.hour.offset(new Date(), +3);
                        return;
                    }
                    // tasks.sort(function(a, b) {
                    //     return a.endDate - b.endDate;
                    // });
                    timeDomainEnd = tasks[tasks.length - 1].endDate;
                    // tasks.sort(function(a, b) {
                    //     return a.startDate - b.startDate;
                    // });
                    timeDomainStart = tasks[0].startDate;
                }
            };

            var initAxis = function(timeDomainString) {
                var range = tasks.length * 15;
                //if(isSingleBrand) {
                //range = tasks.length * 25;
                //}
                x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
                y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, range]);

                //TO DO - better names
                var formatDay = d3.time.format("%d");
                var formatMonth = d3.time.format("%b %d");

                var formatQuarter = d3.time.format("%b '%y");
                var formatMonthOnly = d3.time.format("%b");

                var count = 0;
                var tickType = d3.time.days;
                switch (timeDomainString) {
                    case "quarter":
                    case "year":
                        tickType = d3.time.months;
                }

                xAxis = d3.svg.axis()
                    .scale(x).orient("top")
                    .tickFormat(function(d) {

                        count++;
                        if (timeDomainString == "month" || timeDomainString == "today" || timeDomainString == "week") {
                            if (count == 1 || moment(d).format("D") == 1) {
                                return formatMonth(d);
                            } else {
                                return formatDay(d);
                            }
                        } else {
                            //year or quarter
                            if (count == 1) {
                                return formatQuarter(d);
                            } else {
                                return formatMonthOnly(d);
                            }

                        }

                        //if first - show date and month, 
                        //if 1st day of month - show month, day
                        //if other views - quarter, year, month 
                        //year - show month - year for 1st

                    })
                    .ticks(tickType, 1)
                    .tickSize(height - margin.top, height - margin.top)
                    .tickPadding(-30); //modified from 8

                yAxis = d3.svg.axis().scale(y).orient("left").tickFormat("").tickSize(0); //.tickFormat("")


            };

            function gantt(tasks) {

                initTimeDomain(tasks);
                initAxis();

                var svg = d3.select("#calendar_widget")
                    .append("svg")
                    .attr("class", "chart")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("class", "gantt-chart")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

                //changing rendering order to fix day marker under tick text
                svg.append('rect').attr("class", "marker");
                svg.append('rect').attr("class", "marker_body");

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
                    .transition()
                    .call(xAxis)
                    .selectAll(".tick text").attr("style", "font-family:Avenir;font-size:14px;").attr("x", function(d) {
                        return 10
                    });

                svg.append("g").attr("class", "y axis").transition().call(yAxis);

                svg.append("line").attr("class", "axis_top");
                svg.append("line").attr("class", "axis_bottom");


                gantt.draw(tasks);

                svg.append('rect').attr("class", "date_marker");

                return gantt;

            };

            gantt.draw = function(tasks, timeDomainString) {

                var prevScale = 0;

                var svg = d3.select("#calendar_widget").select("svg");

                //-------


                // svg.call(d3.behavior.zoom().on("zoom", function(){
                //         var td = gantt.timeDomain();
                //         //var scale = (td[1]-td[0])/10;
                //         var scale = (td[1]-td[0]);

                //         // if (td[1]-td[0] > scale) {
                //             if (d3.event.scale < prevScale)
                //                 gantt.timeDomain([td[0]-scale, td[1]+scale]);
                //             else
                //                 gantt.timeDomain([td[0]+scale, td[1]-scale]);
                //             gantt.redraw(tasks);
                //             prevScale = d3.event.scale;
                //             d3.event.sourceEvent.stopPropagation();
                //         // }
                //         // else {
                //         //     // just dont re-draw
                //         //     if (d3.event.scale < prevScale)
                //         //         gantt.timeDomain([td[0]-scale, td[1]+scale]);
                //         //     else
                //         //         gantt.timeDomain([td[0]+scale, td[1]-scale]);
                //         //     prevScale = d3.event.scale;
                //         //     d3.event.sourceEvent.stopPropagation();
                //         // }
                //     }))
                // ;

                svg
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);

                svg.call(d3.behavior.drag()
                    .on('dragstart', function() {
                        d3.event.sourceEvent.stopPropagation();
                    })
                    .on('drag', function() {
                        var td = gantt.timeDomain();
                        var scale = (td[1]-td[0])/1000;
                        //var scale = (td[1] - td[0]) / 1000;

                        d3.event.sourceEvent.stopPropagation();
                        //var td = gantt.timeDomain();


                        var data = _.sortBy(tasks, function(o) { return o.start_date; });

                        if (d3.event.dx < 0) {
                            //if user requests next duration data -  scroll the view 
                            gantt.timeDomain([td[0] - scale * d3.event.dx, td[1] - scale * d3.event.dx]);
                            gantt.redraw(tasks, timeDomainString);
                        } else if(moment(_.first(data).startDate).toDate() < moment(td[0]).toDate()) {
                            //if user asks for previous period data - check if available
                            if( moment(_.first(data).startDate).toDate() < moment((td[0] - scale * d3.event.dx)).toDate() ) {
                                //second line of defence to limit scroll to previous duration based on the amount of drag :)
                                gantt.timeDomain([td[0] - scale * d3.event.dx, td[1] - scale * d3.event.dx]);
                            } else {
                                //do a partial scroll to reach dead edge
                                gantt.timeDomain([td[0] - scale , td[1] - scale]);
                            }
                            gantt.redraw(tasks, timeDomainString);
                        } 
                        // if (d3.event.dx < 0) {
                        //     next(timeDomainString);
                        // } else {
                        //     prev(timeDomainString);
                        // }
                        

                        
                    })
                    .on('dragend', function() {
                        d3.event.sourceEvent.stopPropagation();
                    }));


                //------
                var tdEdges = gantt.timeDomain(); 
                var isPast = function (timeDomainEdge, date) {
            		if(moment(timeDomainEdge).toDate() <= moment(date).toDate()){
            			return true;
            		} else {
            			return false;
            		}
                };
                var isFuture = function (timeDomainEdge, date) {
            		if(moment(timeDomainEdge).toDate() >= moment(date).toDate()){
            			return true;
            		} else {
            			return false;
            		}
                };


                var ganttChartGroup = svg.select(".gantt-chart");

                //axis top line
                ganttChartGroup.selectAll('line.axis_top')
                    .style("stroke", "#ccd2da")
                    .attr("x1", 0)
                    .attr("y1", -20)
                    .attr("x2", width)
                    .attr("y2", -20)
                    .style("fill", "none")
                    .style("shape-rendering", "crispEdges");

                //axis second line
                //TODO: add Vertical gradient from #939ead to #e9ebee. Opacity 0.3
                ganttChartGroup.selectAll('line.axis_bottom')
                    .style("stroke", "#ccd2da")
                    .attr("x1", 0)
                    .attr("y1", 26)
                    .attr("x2", width)
                    .attr("y2", 26)
                    .style("fill", "none")
                    .style("stroke-width", "1")
                    //.style("opacity","0.3")
                    .style("shape-rendering", "crispEdges");
  

                var rectData = ganttChartGroup.selectAll(".node").data(tasks, keyFunction);
                var rect = rectData.enter();
                var rectGroup = rect.append("g").attr("class", "node")
                    .on("click", function(d) {
                        if (d.type != "brand") {
                            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', ('campaign_status_' + d.state + '_performance_' + d.kpiStatus), loginModel.getLoginName());
                            document.location = '#/campaigns/' + d.id;
                        }
                    })

                //on mouseover tanstitions for campaigns 
                //resize and display the campaign text 
                .on('mouseover', function(d) {
                        var width = (x(d.endDate) - x(d.startDate));
                        //character count of the camapaign name
                        var stringLength = d.name.length;
                        //considering each character takes 12px
                        var newWidth = stringLength * 12;
                        //if qualifying element
                        //if width below a limit
                        //calculate the width of container and  re populate the text
                        if (d.type != "brand") {
                            if (newWidth > width) {
                                //var rect = d3.select(this);
                                //rect.select("rect.campaigns").attr("width", newWidth-4);

                                //icon - check if it fits the display criteria
                                var icon = d3.select(this).select("image.icon");
                                icon.style('display', function(d){
                                    if ((x(d.endDate) - x(d.startDate)) > 0){
                                        return "block";
                                    } else {
                                        return "none";
                                    }
                                });
                                //check if text fits the display criteria
                                var container = d3.select(this).select("text.campaigns_name");
                                container.style('display', function(d){
                                    if ((x(d.endDate) - x(d.startDate)) > 0){
                                        return "block";
                                    } else {
                                        return "none";
                                    }
                                });
                               
                                container.text(function(d) {
                                    return d.name;
                                });
                                    
                            }
                        }

                    })
                    .on('mouseout', function(d) {
                        var width = (x(d.endDate) - x(d.startDate));
                        var stringLength = d.name.length;
                        if (d.type != "brand") {
                            //var rect = d3.select(this);
                            //rect.select("rect.campaigns").attr("width", width-4);

                            if (width > 25) {
                                //minimum width to fit in the icon
                                width = Math.abs(25 - width);
                            }
                            //considering approx. of 10px for a character
                            var fitCount = width / 7;

                            //check if there is space to render icon - if not hide it
                            var icon = d3.select(this).select("image.icon");
                            icon.style('display', function(d) {
                                if ((x(d.endDate) - x(d.startDate)) <= 40){
                                    return "none";
                                } else {
                                    return "block";
                                }

                            });

                            //check if text is supposed to be visible - if not hide
                            var container = d3.select(this).select("text.campaigns_name");
                            container.style('display', function(d) {
                                if ((x(d.endDate) - x(d.startDate)) <= 40){
                                    return "none";
                                } else {
                                    return "block";
                                }

                            });

                            container.text(function(d) {
                                if (fitCount >= stringLength) {
                                    //texts fits :)
                                    return d.name;
                                } else {
                                    return d.name.substr(0, fitCount) + "...";
                                }
                            });

                        }
                    });

                //brand grouping
                rectGroup.append("text")
                    .attr("class", "brand_name")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", ".35em")
                    .attr("font-size", "20px")
                    .attr("font-weight", "900")
                    .attr("fill", "#21252b")
                    .attr("font-family", "Avenir")
                    .attr("style", function(d) {
                        if (d.type == "brand") {
                            return "";
                        } else {
                            return "display:none";
                        }
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .transition()
                    .attr("transform", rectTransform);
                //brand grouping ends

                //top bar 
                rectGroup.append("rect")
                	.attr("x", 0)
                    .attr("class", "header")
                    .attr("style", "cursor:pointer")
                    .attr("fill", function(d) {
                        if (d.kpiStatus == "ontrack") {
                            return onTrackColor;
                        } else if (d.kpiStatus == "underperforming") {
                            return underperformingColor;
                        } else {
                            return noStatusColor;
                        }
                    })
                    .attr("width", function(d) {
                        if (d.type == "brand")
                            return 0;
                        else if (d.kpiStatus == "ontrack" || d.kpiStatus == "underperforming" || d.kpiStatus == "NA" || d.kpiStatus === undefined) {
                            return (x(d.endDate) - x(d.startDate));
                        } else {
                            return 0;
                        }
                    })
                    .attr("height", CAMPAIGN_HEIGHT + 1)
                    .transition().delay(0)
                    .attr("transform", rectTransform);

                rectGroup.append("rect")
                    .attr("x", 0)
                    .attr("y", 2)
                    // .attr("title", function(d) {
                    //     return "campaign";
                    // })
                    .attr("id", function(d, i) {
                        return "campaign-" + i;
                    })
                    .attr("class", "text_container")
                    .attr("style", "cursor:pointer")
                    .attr("class", function(d) {
                        if (taskStatus[d.kpiStatus] == null) {
                            return "bar campaigns";
                        }
                        return taskStatus[d.kpiStatus] + " campaigns";
                    })
                    .attr("width", function(d) {
                        if (d.type == "brand")
                            return 0;
                        else {
                            var width = (x(d.endDate) - x(d.startDate));// - 4;
                            //check if in past ; cut edge
                    		// if(!isPast(tdEdges[0], d.startDate)) {
                    		// 	width = width + 2;
                    		// }
                            if (width >= 0)
                                return (width);
                            else
                                return 0;
                        }
                    })
                    .attr("height", function(d) {
                        return CAMPAIGN_HEIGHT - 2
                    })
                    .transition().delay(0)
                    .attr("transform", rectTransform);

                //Stroke - Bottom for the campaign (1px #ccd2da)
                rectGroup.append("line")
                    .attr('class', 'campaign_stroke')
                    .attr("x1", function(d){
                        if (d.type == "brand") {
                            return 0;
                        } else {
                            return 0;
                        }
                    })
                    .attr("y1", function(d){
                        if (d.type == "brand") {
                            return 0;
                        } else {
                            return y(d.taskName) + CAMPAIGN_HEIGHT;
                        }
                    })
                    .attr("y2", function(d){
                        if (d.type == "brand") {
                            return 0;
                        } else {
                            return y(d.taskName) + CAMPAIGN_HEIGHT;
                        }
                    })
                    .attr("x2", function(d) {
                        if (d.type == "brand") {
                            return 0;
                        } else {
                            return x(d.endDate) - x(d.startDate);
                        }
                    })
                    .style('stroke', '#ccd2da')
                    .style('stroke-width', '1px')
                    .style('shape-rendering', 'crispEdges')
     
                rectGroup.append("text")
                    .attr("class", "campaigns_name")
                    .attr("x", 30)
                    .attr("y", CAMPAIGN_HEIGHT / 2)
                    .attr("dy", ".35em")
                    .attr("font-family", "Avenir")
                    .attr("style", function(d) {
                        if (d.type == "brand") {
                            return "display:none";
                        } else if ((x(d.endDate) - x(d.startDate)) != 0) {
                            return "cursor:pointer";
                        } else {
                            return "display:none";
                        }
                    })
                    .text(function(d) {
                        //widht of the container
                        var width = (x(d.endDate) - x(d.startDate));
                        //character count of the camapaign name
                        var stringLength = d.name.length;
                        if (width > 25) {
                            //minimum width to fit in the icon
                            width = Math.abs(25 - width);
                        }
                        //considering approx. of 10px for a character
                        var fitCount = width / 7;
                        if (fitCount >= stringLength) {
                            //texts fits :)
                            return d.name;
                        } else {
                            return d.name.substr(0, fitCount) + "...";
                        }
                    })
                    .transition()
                    .attr("transform", rectTransform);

                rectGroup.append("image")
                    .attr("class", "icon")
                    .attr("x", CAMPAIGN_HEIGHT / 3)
                    .attr("y", CAMPAIGN_HEIGHT / 5)
                    .attr("height", CAMPAIGN_HEIGHT - 11)
                    .attr("width", function(d) {
                        if (d.type == "brand")
                            return 0;
                        else if ((x(d.endDate) - x(d.startDate)) != 0) {
                            return 13;
                        } else {
                            return 0;
                        }
                    })
                    .attr("xlink:href", function(d) {
                        switch (d.state) {
                            case "Active":
                                return window.assets.active;
                            case "Paused":
                                return window.assets.paused;
                            case "Draft":
                                return window.assets.draft;
                            case "Ready":
                                return window.assets.ready;
                            case "Completed":
                                return window.assets.completed;

                        }
                    })
                    .on('mouseover', function(d) {
                        //mouseover on icon - display tooltip
                        var xPosition = x(d.startDate) + 25,
                        yPosition = (y(d.taskName)*2 ) - 15;
                        d3.select(".calendar_tooltip")
                            .style("display", "block")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .text(d.state);
                    })
                    .on('mouseout', function(d) {
                        //mouseout on icon - hide tooltip
                        d3.select(".calendar_tooltip")
                            .style("display", "none");
                    })
                    .transition()
                    .attr("transform", rectTransform);
                //today marker
                ganttChartGroup.select("rect.marker")
                    .attr("x", 0)
                    .attr("y", 1)
                    .attr("class", "marker")
                    //.attr("style", "cursor:pointer")
                    .attr("fill", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 0) {
                            return "none"
                        } else if (width <= 40) {
                            if (timeDomainString == "today") {
                                return "none";
                            }
                            return "#74AFDD" //BLUE - LINE COLOR
                        } else {
                            return "#e7edf1"
                        }
                    })
                    .attr("width", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 0) {
                            width = 0;
                        } else if (width <= 40) {
                            width = 0; //2
                        }
                        return width;
                    })
                    .attr("height", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 40) {
                            return 0; //height - margin.top
                        } else {
                            return 4;
                        }

                    })
                    .transition()
                    .attr("transform", markerTransform);

                //body
                ganttChartGroup.select("rect.marker_body")
                    .attr("x", 0)
                    .attr("y", 4)
                    .attr("class", "marker_body")
                    //.attr("style", "cursor:pointer")
                    .attr("fill", '#f5f9fd')
                    .attr("width", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 40) {
                            width = 0;
                        }
                        return width;
                    })
                    .attr("height", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 40) {
                            return 0;
                        } else {
                            return height - margin.top;
                        }

                    })
                    .transition()
                    .attr("transform", markerTransform);

                    //for year, quarter, month - marker 
                    ganttChartGroup.select("rect.date_marker")
                     .attr("x", 0)
                    .attr("y", 47)
                    .attr("class", "date_marker")
                    .style("shape-rendering", "crispEdges")
                    .attr("fill", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 0) {
                            return "none"
                        } else if (width <= 40) {
                            if (timeDomainString == "today") {
                                return "none";
                            }
                            return "#74AFDD" //BLUE - LINE COLOR
                        } else {
                            return "none"
                        }
                    })
                    .attr("width", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 0) {
                            width = 0;
                        } else if (width <= 40) {
                            width = 2;
                        }
                        return width;
                    })
                    .attr("height", function() {
                        var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                        if (width <= 40) {
                            return height - margin.top - 47;
                        } else {
                            return 0;
                        }

                    })
                    .transition()
                    .attr("transform", markerTransform);

                    
                //today marker ends

                var node = ganttChartGroup.selectAll(".node").data(tasks, keyFunction);
                var campaignBody = ganttChartGroup.selectAll(".campaigns").data(tasks, keyFunction);
                var campaignText = ganttChartGroup.selectAll(".campaigns_name").data(tasks, keyFunction);

                var brandNameText = ganttChartGroup.selectAll(".brand_name").data(tasks, keyFunction);
                var campaignTopStroke = ganttChartGroup.selectAll(".header").data(tasks, keyFunction);
                var campaignsStatusIcon = ganttChartGroup.selectAll(".icon").data(tasks, keyFunction);

                var campaignsBottomStroke = ganttChartGroup.selectAll(".campaign_stroke").data(tasks, keyFunction);
                
                //Stroke - Bottom for the campaign (1px #ccd2da)
                campaignsBottomStroke
                    .transition()
                        .delay(0)
                        .attr("y2", function(d){
                            if (d.type == "brand") {
                                return 0;
                            } else {
                                return y(d.taskName) + CAMPAIGN_HEIGHT;
                            }
                        })
                        .attr("x2", function(d) {
                            if (d.type == "brand") {
                                return 0;
                            } else {
                                var width = x(d.endDate) - x(d.startDate);
                                if(width > 0) {
                                    return width - 2;
                                } else {
                                    return 0;
                                }
                            }
                        })
                      
                
                var translateVisualElements = function(a, type) {
                    if (type == "node") {
                        a.transition()
                            .delay(0).attr("transform", rectTransform);

                    } else if (type == "body") {
                        a.transition()
                            .delay(0).attr("width", function(d) {
                                if (d.type == "brand")
                                    return 0;
                                else {
                                    var width = (x(d.endDate) - x(d.startDate)) - 4;
	                                    if(!isFuture(tdEdges[1], d.endDate) && isPast(tdEdges[0], d.startDate)) {
			                    			width = width + 4;
			                    		} else if(isFuture(tdEdges[1], d.endDate) && !isPast(tdEdges[0], d.startDate)) {
			                    			width = width + 2;
			                    		}else if(!isFuture(tdEdges[1], d.endDate) && !isPast(tdEdges[0], d.startDate)) {
			                    			width = width + 4;
			                    		}

                                    if (width >= 0)
                                        return (width);
                                    else
                                        return 0;
                                }
                            })
                            .attr("y", function(d) {
                                return y(d.taskName) + 2;
                            })
                    } else if (type == "top") {
                        a.transition()
                            .delay(0).attr("width", function(d) {
                                if (d.type == "brand")
                                    return 0;
                                else if (d.kpiStatus == "ontrack" || d.kpiStatus == "underperforming" || d.kpiStatus == "NA" || d.kpiStatus === undefined) {
                                  	
                                    //fix for removing the  rectangle that was sticking on the axis even after campaigns were scrolled out of the view
                                    if(x(d.endDate) - x(d.startDate) == 0) {
                                        return 0;
                                    }

                                    if(!isFuture(tdEdges[1], d.endDate) && isPast(tdEdges[0], d.startDate)) {
                                        return (x(d.endDate) - x(d.startDate)) + 2;
                                  	}

                                    return (x(d.endDate) - x(d.startDate));
                                } else {
                                    return 0;
                                }
                            })
                            .attr("x", function(d){
                            	if(isPast(tdEdges[0], d.startDate)) {
		                    			return -2;
		                    	} else {
		                    		return 0;
		                    	}
                            })
                            .attr("y", function(d) {
                                return y(d.taskName);
                            })
                    }
                };

                var translateGraphicElements = function(a, type) {
                    if (type == "brand_name") {
                        //a.transition()
                           // .delay(0).attr("transform", rectTransform);

                    } else if (type == "text") {
                        a.transition()
                            .delay(0).attr("width", function(d) {
                                if ((x(d.endDate) - x(d.startDate)) != 0) {
                                    return 15;
                                } else {
                                    return 0;
                                }
                            })
                            .attr("style", function(d) {
                                if (d.type == "brand")
                                    return "display:none";
                                else if ((x(d.endDate) - x(d.startDate)) >= 40) {
                                    return "cursor:pointer";
                                } else {
                                    return "display:none";
                                }
                            })
                            .attr("y", function(d) {
                                return y(d.taskName) + 13;
                            })
                            .text(function(d) {
                                //widht of the container
                                var width = (x(d.endDate) - x(d.startDate));
                                //character count of the camapaign name
                                var stringLength = d.name.length;
                                if (width > 25) {
                                    //minimum width to fit in the icon
                                    width = Math.abs(25 - width);
                                }
                                //considering approx. of 10px for a character
                                var fitCount = width / 7;
                                if (fitCount >= stringLength) {
                                    //texts fits :)
                                    return d.name;
                                } else {
                                    return d.name.substr(0, fitCount) + "...";
                                }
                            })
                    } else {
                        a.transition()
                            .delay(0).attr("style", function(d) {
                                if (d.type == "brand")
                                    return "display:none";
                                else if ((x(d.endDate) - x(d.startDate)) >= 40) {
                                    return "cursor:pointer";
                                } else {
                                    return "display:none";
                                }
                            })
                            .attr("width", function(d) {
                                if (d.type == "brand")
                                    return 0;
                                else if ((x(d.endDate) - x(d.startDate)) != 0) {
                                    return 13;
                                } else {
                                    return 0;
                                }
                            })
                            .attr("y", function(d) {
                                return y(d.taskName) + 6;
                            })
                    }
                };

                translateVisualElements(node, "node");
                translateVisualElements(campaignBody, "body");
                translateVisualElements(campaignTopStroke, "top");

                translateGraphicElements(campaignText, "text");
                translateGraphicElements(brandNameText, "brand_name");
                translateGraphicElements(campaignsStatusIcon);

                rectData.exit().remove();
                //today marker transition
                // ganttChartGroup.select("rect.marker")
                //   .transition()
                //   .attr("transform", markerTransform)
                // .attr("width", function(){
                //  	var width = (x(moment().endOf('day')) - x(moment().startOf('day')));
                //  	if(width<=40) {
                //  		width =2;
                //  	}

                //  	return width;
                //  });
                //today marker transition
                svg.select(".x").transition().call(xAxis)
                    .selectAll(".tick text").attr("style", "font-family:Avenir;font-size:14px")
                    .attr("x", function(d, i) {
                        //formatting for ticks
                        if (timeDomainString == "month") {
                            if (i == 0) {
                                return 10;
                            } else {
                                return 10;
                            }
                        } else if (timeDomainString == "today") {
                            if (i == 0) {
                                return 30;
                            } else {
                                return 60;
                            }
                        } else if (timeDomainString == "year") {
                            if (i == 0) {
                                return 16;
                            } else {
                                return 26;
                            }
                        } else {
                            if (i == 0) {
                                return 128;
                            } else {
                                return 145;
                            }
                        }
                    })
                    .attr("y", function(d, i) {
                        //formatting for ticks
                        if (timeDomainString == "month") {
                            if (i == 0) {
                                return (height - 10) * -1;
                            } else {
                                return (height - 70) * -1;
                            }
                        } else {
                            return (height - 50) * -1;
                        }
                    })
                    .call(wrap, 10, timeDomainString, function(d, i) {
                        //formatting for ticks
                        if (timeDomainString == "month") {
                            if (i == 0) {
                                return 5;
                            } else {
                                return 10;
                            }
                        } else if (timeDomainString == "today") {
                            if (i == 0) {
                                return 60;
                            } else {
                                return 60;
                            }
                        } else if (timeDomainString == "year") {
                            if (i == 0) {
                                return 26;
                            } else {
                                return 26;
                            }
                        } else {
                            if (i == 0) {
                                return 145;
                            } else {
                                return 145;
                            }
                        }
                    }, height);

                // svg.select(".x").transition().call(xAxis)
                //     .selectAll(".tick text").attr("style", "font-family:Avenir;font-size:12pt").attr("x", function(d, i) {
                // 		//formatting for ticks
                // 		var spacing;
                //     	if(timeDomainString == "month") {
                // 		if(i == 0) {return -30; }else {return 5;}
                //     	} else if(timeDomainString == "today") {
                // 		if(i == 0) {return 30; }else {return 60;}
                //     	} else if(timeDomainString == "year") {
                // 		if(i == 0) {return 16; }else {return 26;}
                //    		} else {
                //         	if(i == 0) {return 128; }else {return 145;}
                //     	} 
                //     });



                svg.select(".y").transition().call(yAxis).selectAll(".tick text").attr("style", "font-weight:bold;font-family:Avenir;font-size:13pt");

                return gantt;
            };

            gantt.redraw = function(tasks, timeDomainString) {
                //console.log('redraw');
                initTimeDomain(tasks);
                initAxis(timeDomainString);
                gantt.draw(tasks, timeDomainString);
                return gantt;
            };

            gantt.margin = function(value) {
                if (!arguments.length)
                    return margin;
                margin = value;
                return gantt;
            };

            gantt.timeDomain = function(value) {
                if (!arguments.length)
                    return [timeDomainStart, timeDomainEnd];
                timeDomainStart = +value[0], timeDomainEnd = +value[1];
                return gantt;
            };

            /**
             * @param {string}
             *                vale The value can be "fit" - the domain fits the data or
             *                "fixed" - fixed domain.
             */
            gantt.timeDomainMode = function(value) {
                if (!arguments.length)
                    return timeDomainMode;
                timeDomainMode = value;
                return gantt;

            };

            gantt.taskTypes = function(value) {
                if (!arguments.length)
                    return taskTypes;
                taskTypes = value;
                return gantt;
            };

            gantt.taskStatus = function(value) {
                if (!arguments.length)
                    return taskStatus;
                taskStatus = value;
                return gantt;
            };

            gantt.width = function(value) {
                if (!arguments.length)
                    return width;
                width = +value;
                return gantt;
            };

            gantt.height = function(value) {
                if (!arguments.length)
                    return height;
                height = +value;
                return gantt;
            };

            gantt.tickFormat = function(value) {
                if (!arguments.length)
                    return tickFormat;
                tickFormat = value;
                return gantt;
            };

            gantt.isSingleBrand = function(singleBrand) {
                if (singleBrand == true) {
                    isSingleBrand = true;
                } else {
                    isSingleBrand = false;
                }
                return gantt;
            }

            return gantt;
        }; //end of gantt


        var gantt;
        var tasks = [];
        var taskNames = [];
        var taskStatus;
        var maxDate;
        var minDate;
        var format;
        var timeDomainString;

        function wrap(text, width, timeDomainString, x, height) {
            if (timeDomainString == 'month') {
                text.each(function() {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = -1 * (height - 60), //text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        i = 0,
                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                    dy = -1.2;
                    while (word = words.pop()) {
                        if (word == "Jan" || word == "Feb" || word == "Mar" || word == "Apr" || word == "May" || word == "Jun" || word == "Jul" || word == "Aug" || word == "Sep" || word == "Oct" || word == "Nov" || word == "Dec") {
                            y = y - 17;
                            x = 3;
                        } else {
                            x = 9;
                        }

                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }
        }

        function addTask() {
            var lastEndDate = getEndDate();
            var taskStatusKeys = Object.keys(taskStatus);
            var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
            var taskName = "TWC"; //taskNames[Math.floor(Math.random() * taskNames.length)];
            var name = "Test Campaign - Status:" + taskStatusName + " - Brand:" + taskName;

            tasks.push({
                "startDate": d3.time.day.offset(lastEndDate, Math.ceil(Math.random(10))),
                "endDate": d3.time.day.offset(lastEndDate, (Math.ceil(300)) + 1),
                "taskName": taskName,
                // "type": "brand",
                "status": taskStatusName,
                "name": name
            });

            changeTimeDomain(timeDomainString);
            gantt.redraw(tasks);
        };


        function getEndDate() {
            var lastEndDate = Date.now();
            if (tasks.length > 0) {
                lastEndDate = tasks[tasks.length - 1].endDate;
            }

            return lastEndDate;
        }

        function prev(timeDomainString) {
            var td = gantt.timeDomain();
            //var scale = (td[1] - td[0]);
            var edge1, edge2;
            var tdMonth = moment(td[0]).format('MM');
            var tdDay = moment(td[0]).format('DD');
            var qStart, qEnd;

            var data = _.sortBy(tasks, function(o) {
                return o.start_date;
            });
            //force stop scroll on edge
            if (moment(_.first(data).startDate).toDate() < moment(td[0]).toDate()) {

                var edge1, edge2;
                switch (timeDomainString) {
                    case 'quarter':
                        if (tdMonth == 1 || tdMonth == 4 || tdMonth == 7 || tdMonth == 10) {
                            edge1 = moment(td[0]).subtract(3, 'months').startOf('month').unix() * 1000;
                            edge2 = moment(edge1).add(2, 'months').endOf('month').unix() * 1000;
                        } else {
                            if (tdMonth >= 1 && tdMonth <= 3) {
                                //find prev quarter
                                qStart = 0;
                                qEnd = 2;
                            } else if (tdMonth >= 4 && tdMonth <= 6) {
                                qStart = 3;
                                qEnd = 5;
                            } else if (tdMonth >= 7 && tdMonth <= 9) {
                                qStart = 6;
                                qEnd = 8;
                            } else if (tdMonth >= 10 && tdMonth <= 12) {
                                qStart = 9;
                                qEnd = 11;
                            }

                            var fix = (tdMonth) - (qStart + 1);
                            edge1 = moment(td[0]).subtract(fix, 'months').startOf('month').unix() * 1000;
                            edge2 = moment(edge1).add(2, 'months').endOf('month').unix() * 1000;
                        }
                        break;
                    case 'year':
                        if (tdMonth != 1) {
                            var fix = tdMonth - 1;
                            edge1 = moment(td[0]).subtract(fix, 'months').startOf('month').unix() * 1000;
                            edge2 = moment(edge1).add(11, 'months').endOf('month').unix() * 1000;

                        } else {
                            edge1 = moment(td[0]).subtract(12, 'months').startOf('month').unix() * 1000;
                            edge2 = moment(edge1).add(11, 'months').endOf('month').unix() * 1000;
                        }
                        break;
                    case 'month':
                        if (tdDay != 1) {
                            var firstDay = moment(td[0]).startOf('month').format('DD');
                            var fix = (tdDay - firstDay) - 1;

                            edge1 = moment(td[0]).subtract(fix + 1, 'days').startOf('day').unix() * 1000;
                            edge2 = moment(edge1).add(30, 'days').endOf('day').unix() * 1000;
                        } else {
                            edge1 = moment(td[0]).subtract(1, 'months').startOf('month').unix() * 1000;
                            edge2 = moment(edge1).add(30, 'days').endOf('day').unix() * 1000;
                        }
                        break;
                    case 'today':

                        if(moment(_.first(data).startDate).toDate() < moment(td[0]).subtract(7, 'days').startOf('day').toDate()) {
                            edge1 = moment(td[0]).subtract(7, 'days').startOf('day').unix() * 1000;
                            edge2 = moment(edge1).add(6, 'days').endOf('day').unix() * 1000;
                        } else {
                            //fix for week view - scroll lock on edges
                            var a = moment(td[0]);
                            var b = moment(_.first(data).startDate);
                            var diff = a.diff(b, 'days');

                            //set to the minimum date - if less than a week
                            edge1 = moment(td[0]).subtract(diff, 'days').startOf('day').unix() * 1000;
                            edge2 = moment(edge1).add(6, 'days').endOf('day').unix() * 1000;

                        }

                        
                        break;
                }

                gantt.timeDomain([edge1, edge2]);
                gantt.redraw(tasks, timeDomainString);
            }


        }

        function next(timeDomainString) {
            var td = gantt.timeDomain();
            //var scale = (td[1] - td[0]);
            var edge1, edge2;
            var tdMonth = moment(td[0]).format('MM');
            var tdDay = moment(td[0]).format('DD');
            var qStart, qEnd;



            switch (timeDomainString) {
                case 'quarter':
                    if (tdMonth == 1 || tdMonth == 4 || tdMonth == 7 || tdMonth == 10) {
                        edge1 = moment(td[0]).add(3, 'months').startOf('month').unix() * 1000;
                        edge2 = moment(edge1).add(2, 'months').endOf('month').unix() * 1000;
                    } else {

                        if (tdMonth >= 1 && tdMonth <= 3) {
                            //find next quarter
                            qStart = 3;
                            qEnd = 5;
                        } else if (tdMonth >= 4 && tdMonth <= 6) {
                            qStart = 6;
                            qEnd = 8;
                        } else if (tdMonth >= 7 && tdMonth <= 9) {
                            qStart = 9;
                            qEnd = 11;
                        } else if (tdMonth >= 10 && tdMonth <= 12) {
                            qStart = 0;
                            qEnd = 2;
                        }
                        //number of months to next quarter
                        var fix = (qStart + 1) - (tdMonth);
                        if (qStart == 0) {
                            fix = 13 - tdMonth;
                        }
                        edge1 = moment(td[0]).add(fix, 'months').startOf('month').unix() * 1000;
                        edge2 = moment(edge1).add(2, 'months').endOf('month').unix() * 1000;

                    }
                    break;
                case 'year':
                    if (tdMonth != 1) {
                        var fix = 13 - tdMonth;

                        edge1 = moment(td[0]).add(fix, 'months').startOf('month').unix() * 1000;
                        edge2 = moment(edge1).add(11, 'months').endOf('month').unix() * 1000;

                    } else {
                        edge1 = moment(td[0]).add(12, 'months').startOf('month').unix() * 1000;
                        edge2 = moment(edge1).add(11, 'months').endOf('month').unix() * 1000;
                    }

                    break;
                case 'month':
                    var lastDay = moment(td[0]).endOf('month').format('DD');
                    var fix = lastDay - tdDay;
                    edge1 = moment(td[0]).add(fix + 1, 'days').startOf('day').unix() * 1000;
                    edge2 = moment(edge1).add(30, 'days').endOf('day').unix() * 1000;
                    break;
                case 'today':

                    //get day for weekend
                    //commented some code for future requirement
                    //edge1 = moment(td[0]).weekday(7).startOf('week').unix()*1000;
                    //edge2 = moment(edge1).weekday(6).endOf('week').unix()*1000;
                    edge1 = moment(td[0]).add(7, 'days').startOf('day').unix() * 1000;
                    edge2 = moment(edge1).add(6, 'days').endOf('day').unix() * 1000;
                    break;
            }



            gantt.timeDomain([edge1, edge2]);
            gantt.redraw(tasks, timeDomainString);
        }

        function month() {

            changeTimeDomain('month');

        }

        function today() {

            changeTimeDomain('today');

        }

        function quarter() {

            changeTimeDomain('quarter');

        }

        function year() {

            changeTimeDomain('year');

        }

        function changeTimeDomain(timeDomainString) {

            //calculating timedomain based on present day 
            var todayIs = moment();
            var thisMonth = moment().format("MM");
            var presentYear = moment().format("YYYY");

            switch (timeDomainString) {


                case "1day":
                    format = "%H:%M";
                    gantt.timeDomain([d3.time.day.offset(getEndDate(), -1), getEndDate()]);
                    break;

                case "1week":
                    format = "%d";
                    gantt.timeDomain([d3.time.day.offset(getEndDate(), -15), getEndDate()]);
                    break;

                case "month":
                    format = "%d";

                    gantt.timeDomain([moment().startOf('month'), moment().endOf('month')]);
                    break;

                case "today":
                    format = "%d";
                    //monday to sunday
                    gantt.timeDomain([moment().startOf('day').subtract(3, 'days'), moment().endOf('day').add(3, 'days')]);
                    break;

                case "quarter":
                    format = "%d";

                    var qStart = 0,
                        qEnd = 2;
                    if (thisMonth >= 1 && thisMonth <= 3) {
                        qStart = 0;
                        qEnd = 2;
                    } else if (thisMonth >= 4 && thisMonth <= 6) {
                        qStart = 3;
                        qEnd = 5;
                    } else if (thisMonth >= 7 && thisMonth <= 9) {
                        qStart = 6;
                        qEnd = 8;
                    } else if (thisMonth >= 10 && thisMonth <= 12) {
                        qStart = 9;
                        qEnd = 11;

                    }

                    gantt.timeDomain([moment().month(qStart).startOf('month'), moment().month(qEnd).endOf('month')]);
                    break;


                case "year":
                    format = "%d";
                    gantt.timeDomain([moment().startOf('year'), moment().endOf('year')]);
                    break;

                    // case "next":
                    //     format = "%d";
                    //     gantt.timeDomain([getEndDate(), d3.time.day.offset(getEndDate(), +7)]);
                    //     break;
                    //  case "prev":
                    //     format = "%d";
                    //     gantt.timeDomain([d3.time.day.offset(getEndDate(), -7), getEndDate()]);
                    //     break;
                default:
                    format = "%H:%M"

            }
            gantt.tickFormat(format);
            gantt.redraw(tasks, timeDomainString);
        }




        //********************** IMPLEMENTATION
        function newCalendar(task, taskName, singleBrand) {
            tasks = task;
            taskNames = taskName;

            // tasks = [{
            //     "startDate": new Date("Tue Dec 25 00:00:01 EST 2012"),
            //     "endDate": new Date("Tue Jan 08 23:59:59 EST 2013"),
            //     "taskName": "Sierra",
            //     "status": "RUNNING",
            //     "name": "Campaign Name - X34234 34530453"
            // }, {
            //     "startDate": new Date("Thu Dec 20 00:00:01 EST 2012"),
            //     "endDate": new Date("Thu Jan 10 23:59:59 EST 2013"),
            //     "taskName": "TWC",
            //     "status": "FAILED",
            //     "name": "TWC Auto 2345234 234234SDFS"
            // }, {
            //     "startDate": new Date("Thu Dec 20 00:00:01 EST 2012"),
            //     "endDate": new Date("Thu Jan 10 23:59:59 EST 2013"),
            //     "taskName": "Corolla",
            //     "status": "FAILED",
            //     "name": "TWC Auto 2345234 234234SDFS"
            // }, {
            //     "startDate": new Date("Tue Dec 01 00:00:01 EST 2012"),
            //     "endDate": new Date("Sat Jan 05 23:59:59 EST 2013"),
            //     "taskName": "Eye Care",
            //     "status": "FAILED",
            //     "name": "TWC Auto 2345234 234234SDFS"
            // }];

            taskStatus = {
                "ontrack": "bar",
                "underperforming": "bar",
                "paused": "bar",
                "ready": "bar",
                "completed": "bar"
            };

            // taskNames = ["Toyota","TWC", "Corolla", "Sierra", "Eye Care", "East"];

            // tasks.sort(function(a, b) {
            //     return a.endDate - b.endDate;
            // });
            maxDate = tasks[tasks.length - 1].endDate;
            // tasks.sort(function(a, b) {
            //     return a.startDate - b.startDate;
            // });
            minDate = tasks[0].startDate;

            format = "%d";
            timeDomainString = "quarter";

            var calendar_height = tasks.length * 37;
            calendar_height = (calendar_height > MIN_CALENDAR_HEIGHT) ? calendar_height : MIN_CALENDAR_HEIGHT;

            gantt = d3.gantt(calendar_height).taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format); //.height(450).width(800);;

            var margin = {
                top: 20,
                right: 40,
                bottom: 20,
                left: 50
            };
            gantt.isSingleBrand(singleBrand);

            gantt.margin(margin);
            gantt.timeDomainMode("fixed");
            changeTimeDomain(timeDomainString);
            gantt(tasks);
            gantt.redraw(tasks, timeDomainString);


        };

        function updateCalendar(task, taskName) {
            tasks = [];
            taskNames = [];
            tasks = task;
            taskNames = taskName;

            taskStatus = {
                "ontrack": "bar",
                "underperforming": "bar",
                "paused": "bar",
                "ready": "bar",
                "completed": "bar"
            };

            timeDomainString = "today";
            changeTimeDomain(timeDomainString);
            gantt.redraw(tasks, timeDomainString);


        };

        //expose this function to public
        this.newCalendar = newCalendar;
        this.updateCalendar = updateCalendar;
        this.addTask = addTask;
        this.prev = prev;
        this.next = next;
        this.month = month;
        this.today = today;
        this.year = year;
        this.quarter = quarter;



    })
}());

(function() {
    "use strict";
    commonModule.directive("ganttChart", function() {
        return {
            restrict: 'EAC',
            templateUrl: assets.html_gantt_chart
        }
    })
}());
