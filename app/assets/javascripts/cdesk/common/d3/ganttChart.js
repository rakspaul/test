(function() {
    "use strict";
    commonModule.service("ganttChart", function() {
        this.createGanttChart = function() {

		};

		d3.gantt = function() {
		    var FIT_TIME_DOMAIN_MODE = "fit";
		    var FIXED_TIME_DOMAIN_MODE = "fixed";
		    var CAMPAIGN_HEIGHT = 25;

		    var CALENDAR_HEIGHT = 1100;
		    var CALENDAR_WIDTH = 1050;

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

		    var tickFormat = "%d"; //%b


		    var keyFunction = function(d) {
		        return d.startDate + d.taskName + d.endDate;
		    };

		    var rectTransform = function(d) {
		        return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
		    };

		    var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
		    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, 500]);

		    var xAxis = d3.svg.axis()
		        .scale(x).orient("top")
		        .tickFormat(function(d){
		            	
						count++;
						console.log(d);
		            	if(count == 1){
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
		        x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
		        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, 500]);
			
				//TO DO - better names
				var formatDay = d3.time.format("%d");
				var formatMonth = d3.time.format("%b %d");

				var formatQuarter = d3.time.format("%b ' %y");
				var formatMonthOnly = d3.time.format("%b");

				var count =0;
				var tickType = d3.time.days;
				switch(timeDomainString){
					case "quarter": 
					case "year":
						tickType = d3.time.months;
				}

				        xAxis = d3.svg.axis()
				            .scale(x).orient("top")
				            .tickFormat(function(d){
				            	
								count++;
								if(timeDomainString == "1month" || timeDomainString == "today" || timeDomainString == "week"){
					            	if(count == 1 || moment(d).format("D") == 1){
					            		return formatMonth(d);
					            	} else {
					            		return formatDay(d);
					            	}
					            }else {
					            	//year or quarter
					            	if(count == 1){
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
				            .tickPadding(-15); //modified from 8

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


		        svg.append("g")
		            .attr("class", "x axis")
		            .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
		            .transition()
		            .call(xAxis)
		            .selectAll(".tick text").attr("style", "font-family:Avenir;font-size:12pt;").attr("x", function(d) {
		                return 10
		            });

		        svg.append("g").attr("class", "y axis").transition().call(yAxis);

		        gantt.draw(tasks);		          
		        return gantt;

		    };

		    gantt.draw = function(tasks) {

		        var svg = d3.select("#calendar_widget").select("svg");

		        var ganttChartGroup = svg.select(".gantt-chart");

		        var rectData = ganttChartGroup.selectAll(".node").data(tasks, keyFunction);
		        var rect = rectData.enter();
		        var rectGroup = rect.append("g").attr("class", "node").on("click", function(d) {
		           if(d.type!="brand")
		            	document.location ='#/campaigns/'+d.id;
		        })

		        //on mouseover tanstitions for campaigns 
		        //resize and display the campaign text 
		        .on('mouseover', function(d){
		        	var width=(x(d.endDate) - x(d.startDate));
	            	//character count of the camapaign name
	            	var stringLength = d.name.length;
	            	//considering each character takes 12px
	            	var newWidth = stringLength * 12;
		        	//if qualifying element
		        	//if width below a limit
		        	//calculate the width of container and  re populate the text
		        	if(d.type!="brand"){
		        		if(newWidth > width){
		        			var rect = d3.select(this);
           					rect.select("rect.campaigns").attr("width", newWidth-4);
           					d3.select(this).select("text.campaigns_name")
           					//console.log(rect.select("text","#campaigns_name"));
           					.text(function(d){
           						return d.name;
           					});
           				}
		        	}
		        	
		         })
      			.on('mouseout', function(d){
      				var width=(x(d.endDate) - x(d.startDate));
      				var stringLength = d.name.length;
      				if(d.type!="brand"){
      					var rect = d3.select(this);
           				rect.select("rect.campaigns").attr("width", width-4);

		            	if( width > 25 ){
		            		//minimum width to fit in the icon
		            		width = Math.abs(25 -width);
		            	}
		            	//considering approx. of 10px for a character
		            	var fitCount = width/10;
		            	d3.select(this).select("text.campaigns_name")
           					.text(function(d){
           						if(fitCount >= stringLength){
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
		            .attr("fill","#21252b")
		            .attr("font-family", "Avenir")
		            .attr("style", function(d) {
		                if (d.type=="brand") {
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
		            .attr("class", "header")
		            .attr("style", "cursor:pointer")
		            .attr("fill", function(d){
		            	if(d.kpiStatus == "ontrack") {
		            		return onTrackColor;
		            	} else if(d.kpiStatus == "underperforming") {
		            		return underperformingColor;
		            	} else {
		            		return noStatusColor;
		            	}
		            })
		            .attr("width", function(d) {
		            	if(d.type=="brand")
		                		return 0;
		                else if(d.kpiStatus == "ontrack" || d.kpiStatus == "underperforming" ){
		                	return (x(d.endDate) - x(d.startDate));
		            	}else {
		            		return 0;
		            	}
		            })
		            .attr("height", CAMPAIGN_HEIGHT + 1)
		            .transition()
		            .attr("transform", rectTransform);

		        rectGroup.append("rect")
		        	.attr("x", 2)
		        	.attr("y", 2)
		            .attr("title", function(d) {
		                return "campaign";
		            })
		            .attr("id", function(d, i) {
		                return "campaign-" + i;
		            })
		            .attr("class", "text_container")
		            .attr("style","cursor:pointer")
		            .attr("class", function(d) {
		                if (taskStatus[d.kpiStatus] == null) {
		                    return "bar campaigns";
		                }
		                return taskStatus[d.kpiStatus] + " campaigns";
		            })
		            .attr("width", function(d) {
		            	if(d.type=="brand")
		                	return 0;
		                else {
		                	var width = (x(d.endDate) - x(d.startDate)) -4;
		                		if(width>=0)
		                			return (width);
		                		else 
		                			return 0;
		                }
		            })
		            .attr("height", function(d) {
		                return CAMPAIGN_HEIGHT-2
		            })
		            .transition()
		            .attr("transform", rectTransform);

		        rectGroup.append("text")
		            .attr("class", "campaigns_name")
		            .attr("x", 30)
		            .attr("y", CAMPAIGN_HEIGHT / 2)
		            .attr("dy", ".35em")
		            .attr("font-family", "Avenir")
		            .attr("style", function(d) {
		            	if(d.type=="brand"){
		            		return "display:none";
			            } else if ((x(d.endDate) - x(d.startDate)) != 0) {
			                return "cursor:pointer";
			            } else {
			                return "display:none";
			            }
		            })
		            .text(function(d) {
		            	//widht of the container
		            	var width=(x(d.endDate) - x(d.startDate));
		            	//character count of the camapaign name
		            	var stringLength = d.name.length;
		            	if( width > 25 ){
		            		//minimum width to fit in the icon
		            		width = Math.abs(25 -width);
		            	}
		            	//considering approx. of 10px for a character
		            	var fitCount = width/10;
		            	if(fitCount >= stringLength){
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
		            .attr("height", CAMPAIGN_HEIGHT - 10)
		            .attr("width", function(d) {
		            	if(d.type=="brand")
		                	return 0;
		                else if ((x(d.endDate) - x(d.startDate)) != 0) {
		                    return 15;
		                } else {
		                    return 0;
		                }
		            })
		            .attr("xlink:href", function(d){
		            	switch(d.state){
		            		case "Active": return window.assets.active;
		            		case "Paused": return window.assets.paused;
		            		case "Draft": return window.assets.draft;
		            		case "Ready": return window.assets.ready;
		            		case "Completed": return window.assets.completed;

		            	}
		            })
		            .transition()
		            .attr("transform", rectTransform);


		        var node = ganttChartGroup.selectAll(".node").data(tasks, keyFunction);
		        var campaignBody = ganttChartGroup.selectAll(".campaigns").data(tasks, keyFunction);
		        var campaignText = ganttChartGroup.selectAll(".campaigns_name").data(tasks, keyFunction);
		        var campaignTopStroke = ganttChartGroup.selectAll(".header").data(tasks, keyFunction);
		        var campaignsStatusIcon = ganttChartGroup.selectAll(".icon").data(tasks, keyFunction);


		        var translateVisualElements = function(a , type) {
		            a.transition()
		                .delay(0)
		                .attr("transform", rectTransform)
		                .attr("width", function(d) {
		                	if(d.type=="brand")
		                		return 0;
		                    else if(type == "top"){
		                		if(d.kpiStatus == "ontrack" || d.kpiStatus == "underperforming" ){
		                			return (x(d.endDate) - x(d.startDate));
		            			}else {
		            				return 0;
		            			}
		                	}else{
		                		var width = (x(d.endDate) - x(d.startDate)) -4;
		                		if(width>=0)
		                			return (width);
		                		else 
		                			return 0;
		                	}
		                    
		                });
		        };

		        var translateGraphicElements = function(a, type) {
		            a.transition().delay(0)
		                .attr("transform", rectTransform)
		                .attr("width", function(d) {
		                    if ((x(d.endDate) - x(d.startDate)) != 0) {
		                        return 15;
		                    } else {
		                        return 0;
		                    }
		                })
		                .attr("style", function(d) {
		                	if(d.type=="brand")
		                		return "display:none";
		                    else if ((x(d.endDate) - x(d.startDate)) >= 40) {
		                        return "cursor:pointer";
		                    } else {
		                        return "display:none";
		                    }
		                })
		                .text(function(d) {
		                	if(type == "text") {
				            	//widht of the container
				            	var width=(x(d.endDate) - x(d.startDate));
				            	//character count of the camapaign name
				            	var stringLength = d.name.length;
				            	if( width > 25 ){
				            		//minimum width to fit in the icon
				            		width = Math.abs(25 -width);
				            	}
				            	//considering approx. of 10px for a character
				            	var fitCount = width/10;
				            	if(fitCount >= stringLength){
				            		//texts fits :)
				            		return d.name;
				            	} else {
				            		return d.name.substr(0, fitCount) + "...";
				            	} 
				            }
				        })
		        };

		        translateVisualElements(node);
		        translateVisualElements(campaignBody);
		        translateVisualElements(campaignTopStroke, "top");
		        translateGraphicElements(campaignText,  "text");
		        translateGraphicElements(campaignsStatusIcon);

		        rectData.exit().remove();


		        svg.select(".x").transition().call(xAxis)
		            .selectAll(".tick text").attr("style", "font-family:Avenir;font-size:12pt").attr("x", function(d) {
		                return 20
		            });
		        svg.select(".y").transition().call(yAxis).selectAll(".tick text").attr("style","font-weight:bold;font-family:Avenir;font-size:13pt");

		        return gantt;
		    };

		    gantt.redraw = function(tasks, timeDomainString) {
		        //console.log('redraw');
		        initTimeDomain(tasks);
		        initAxis(timeDomainString);
		        gantt.draw(tasks);
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

		    return gantt;
		}; //end of gantt


		var gantt;
		var tasks = [];
		var taskNames =[];
		var taskStatus;
		var maxDate;
		var minDate;
		var format;
		var timeDomainString;

		function prev() {
		     changeTimeDomain('prev');

		}

		function addTask() {
		    var lastEndDate = getEndDate();
		    var taskStatusKeys = Object.keys(taskStatus);
		    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
		    var taskName = "TWC";//taskNames[Math.floor(Math.random() * taskNames.length)];
		    var name = "Test Campaign - Status:"+taskStatusName+" - Brand:"+taskName;

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

		function next() {
		   
		    changeTimeDomain('next');

		}

		function month() {

		    changeTimeDomain('1month');

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
		    // this.timeDomainString = timeDomainString;
		    switch (timeDomainString) {
		        case "1hr":
		            format = "%H:%M:%S";
		            gantt.timeDomain([d3.time.hour.offset(getEndDate(), -1), getEndDate()]);
		            break;
		        case "3hr":
		            format = "%H:%M";
		            gantt.timeDomain([d3.time.hour.offset(getEndDate(), -3), getEndDate()]);
		            break;

		        case "6hr":
		            format = "%H:%M";
		            gantt.timeDomain([d3.time.hour.offset(getEndDate(), -6), getEndDate()]);
		            break;

		        case "1day":
		            format = "%H:%M";
		            gantt.timeDomain([d3.time.day.offset(getEndDate(), -1), getEndDate()]);
		            break;

		        case "1week":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(getEndDate(), -15), getEndDate()]);
		            break;

		        case "1month":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(getEndDate(), -30), getEndDate()]);
		            break;

				case "today":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(Date.now(), -4), d3.time.day.offset(Date.now(), +3)]);
		            break;

		        case "quarter":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(Date.now(), -45), d3.time.day.offset(Date.now(), +45)]);
		            break;


		        case "year":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(Date.now(), -150), d3.time.day.offset(Date.now(), +150)]);
		            break;

		        case "next":
		            format = "%d";
		            gantt.timeDomain([getEndDate(), d3.time.day.offset(getEndDate(), +7)]);
		            break;
		         case "prev":
		            format = "%d";
		            gantt.timeDomain([d3.time.day.offset(getEndDate(), -7), getEndDate()]);
		            break;
		        default:
		            format = "%H:%M"

		    }
		    gantt.tickFormat(format);
		    gantt.redraw(tasks, timeDomainString);
		}




		//********************** IMPLEMENTATION
		function newCalendar(task, taskName) {
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
		    timeDomainString = "today";



		    gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format); //.height(450).width(800);;

		    var margin = {
		        top: 20,
		        right: 40,
		        bottom: 20,
		        left: 50
		    };
		    gantt.margin(margin);
		    gantt.timeDomainMode("fixed");
		    changeTimeDomain(timeDomainString);
		    gantt(tasks);
		    gantt.redraw(tasks, timeDomainString);


		};

		//expose this function to public
		this.newCalendar = newCalendar;
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
    commonModule.directive("ganttChart", function () {
        return {
            restrict: 'EAC',
            templateUrl: 'gantt_chart'
        }
    })
}());