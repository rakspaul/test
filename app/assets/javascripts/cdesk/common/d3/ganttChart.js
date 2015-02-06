(function() {
    "use strict";
    commonModule.service("ganttChart", function() {
        this.createGanttChart = function() {

		};

		d3.gantt = function() {
		    var FIT_TIME_DOMAIN_MODE = "fit";
		    var FIXED_TIME_DOMAIN_MODE = "fixed";
		    var CAMPAIGN_HEIGHT = 25;

		    var CALENDAR_HEIGHT = 600;
		    var CALENDAR_WIDTH = 1050;

		    var margin = {
		        top: 20,
		        right: 40,
		        bottom: 20,
		        left: 50
		    };

		    var onTrackColor = "#47ab1d";
		    var underperformingColor = "#ee9455";
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
		    var y = d3.scale.ordinal().domain(taskTypes).rangeBands([0, 300]);

		    var xAxis = d3.svg.axis()
		        .scale(x).orient("top")
		        .tickFormat(d3.time.format(tickFormat))
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
		            tasks.sort(function(a, b) {
		                return a.endDate - b.endDate;
		            });
		            timeDomainEnd = tasks[tasks.length - 1].endDate;
		            tasks.sort(function(a, b) {
		                return a.startDate - b.startDate;
		            });
		            timeDomainStart = tasks[0].startDate;
		        }
		    };

		    var initAxis = function() {
		        x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
		        y = d3.scale.ordinal().domain(taskTypes).rangeBands([0, 300]);

		        xAxis = d3.svg.axis()
		            .scale(x).orient("top")
		            .tickFormat(d3.time.format(tickFormat))
		            .ticks(d3.time.days, 1)
		            .tickSize(height - margin.top, height - margin.top)
		            .tickPadding(-15); //modified from 8

		        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

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
		            .selectAll(".tick text").attr("style", "font-family:sans-serif;font-size:12pt;").attr("x", function(d) {
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
		           // alert('click captured' + d.name);
		            document.location ='#/campaigns/'+d.id;
		        });


		        rectGroup.append("rect")
		            .attr("title", function(d) {
		                return "campaign";
		            })
		            .attr("id", function(d, i) {
		                return "campaign-" + i;
		            })
		            .attr("class", function(d) {
		                if (taskStatus[d.status] == null) {
		                    return "bar campaigns";
		                }
		                return taskStatus[d.status] + " campaigns";
		            })
		            .attr("width", function(d) {
		                return (x(d.endDate) - x(d.startDate));
		            })
		            .attr("height", function(d) {
		                return CAMPAIGN_HEIGHT
		            })
		            .transition()
		            .attr("transform", rectTransform);

		        //top bar 
		        rectGroup.append("rect")
		            .attr("class", "header")
		            .attr("fill", function(d){
		            	if(d.status == "ontrack") {
		            		return onTrackColor;
		            	} else if(d.status == "underperforming") {
		            		return underperformingColor;
		            	}
		            })
		            .attr("width", function(d) {
		            	if(d.status == "ontrack" || d.status == "underperforming" ){
		                	return (x(d.endDate) - x(d.startDate));
		            	}else {
		            		return 0;
		            	}
		            })
		            .attr("height", 2)
		            .transition()
		            .attr("transform", rectTransform);

		        rectGroup.append("text")
		            .attr("class", "campaigns_name")
		            .attr("x", 30)
		            .attr("y", CAMPAIGN_HEIGHT / 2)
		            .attr("dy", ".35em")
		            .attr("style", function(d) {
		                if ((x(d.endDate) - x(d.startDate)) != 0) {
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

		        rectGroup.append("image")
		            .attr("class", "icon")
		            .attr("x", CAMPAIGN_HEIGHT / 3)
		            .attr("y", CAMPAIGN_HEIGHT / 5)
		            .attr("height", CAMPAIGN_HEIGHT - 10)
		            .attr("width", function(d) {
		                if ((x(d.endDate) - x(d.startDate)) != 0) {
		                    return 15;
		                } else {
		                    return 0;
		                }
		            })
		            .attr("xlink:href", function(d){
		            	switch(d.status){
		            		case "ontrack": 
		            		case "underperforming": return window.assets.active;
		            		case "paused": return window.assets.paused;
		            		case "ready": return window.assets.ready;
		            		case "completed": return window.assets.completed;

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
		                	if(type == "top"){
		                		if(d.status == "ontrack" || d.status == "underperforming" ){
		                			return (x(d.endDate) - x(d.startDate));
		            			}else {
		            				return 0;
		            			}
		                	}else{
		                		return (x(d.endDate) - x(d.startDate));
		                	}
		                    
		                });
		        };

		        var translateGraphicElements = function(a) {
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
		                    if ((x(d.endDate) - x(d.startDate)) >= 40) {
		                        return "";
		                    } else {
		                        return "display:none";
		                    }
		                });
		        };

		        translateVisualElements(node);
		        translateVisualElements(campaignBody);
		        translateVisualElements(campaignTopStroke, "top");
		        translateGraphicElements(campaignText);
		        translateGraphicElements(campaignsStatusIcon);

		        rectData.exit().remove();


		        svg.select(".x").transition().call(xAxis)
		            .selectAll(".tick text").attr("style", "font-family:sans-serif;font-size:12pt").attr("x", function(d) {
		                return 20
		            });
		        svg.select(".y").transition().call(yAxis);

		        return gantt;
		    };

		    gantt.redraw = function(tasks) {
		        //console.log('redraw');
		        initTimeDomain(tasks);
		        initAxis();
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
		            gantt.timeDomain([d3.time.day.offset(Date.now(), -3), d3.time.day.offset(Date.now(), +3)]);
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
		    gantt.redraw(tasks);
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

		    tasks.sort(function(a, b) {
		        return a.endDate - b.endDate;
		    });
		    maxDate = tasks[tasks.length - 1].endDate;
		    tasks.sort(function(a, b) {
		        return a.startDate - b.startDate;
		    });
		    minDate = tasks[0].startDate;

		    format = "%d";
		    timeDomainString = "1week";

		    console.log("new chart");

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


		};

		//expose this function to public
		this.newCalendar = newCalendar;
		this.addTask = addTask;
		this.prev = prev;
		this.next = next;
		this.month = month;
		this.today = today;



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