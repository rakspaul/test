define(['angularAMD', 'common/services/vistoconfig_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.service('ganttChart', ['$location', '$routeParams', '$rootScope',
            '$window', 'vistoconfig', function ($location, $routeParams, $rootScope, $window, vistoconfig) {
                var MIN_CALENDAR_HEIGHT = 580,
                    BRAND_PADDING = 7,
                    gantt,
                    tasks = [],
                    taskNames = [],
                    taskStatus,
                    maxDate,
                    minDate,
                    format,
                    timeDomainString;

                function wrap(text, width, timeDomainString, x, height) {
                    if (timeDomainString === 'month') {
                        text.each(function () {
                            var text = d3.select(this),
                                words = text.text().split(/\s+/).reverse(),
                                word,
                                line = [],
                                lineNumber = 0,

                                // ems
                                lineHeight = 1.1,

                                // text.attr('y')
                                y = -1 * (height - 60),

                                dy = parseFloat(text.attr('dy')),

                                tspan = text
                                    .text(null)
                                    .append('tspan')
                                    .attr('x', x)
                                    .attr('y', y)
                                    .attr('dy', dy + 'em');

                            dy = -1.2;

                            while (word = words.pop()) { // jshint ignore:line
                                if (word === 'Jan' ||
                                    word === 'Feb' ||
                                    word === 'Mar' ||
                                    word === 'Apr' ||
                                    word === 'May' ||
                                    word === 'Jun' ||
                                    word === 'Jul' ||
                                    word === 'Aug' ||
                                    word === 'Sep' ||
                                    word === 'Oct' ||
                                    word === 'Nov' ||
                                    word === 'Dec') {
                                    y = y - 17;
                                    x = 3;
                                } else {
                                    x = 9;
                                }

                                line.push(word);
                                tspan.text(line.join(' '));

                                if (tspan.node().getComputedTextLength() > width) {
                                    line.pop();
                                    tspan.text(line.join(' '));
                                    line = [word];

                                    tspan = text
                                        .append('tspan')
                                        .attr('x', x)
                                        .attr('y', y)
                                        .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                                        .text(word);
                                }
                            }
                        });
                    }
                }

                function addTask() {
                    var lastEndDate = getEndDate(),
                        taskStatusKeys = Object.keys(taskStatus),
                        taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)],
                        taskName = 'TWC',
                        name = 'Test Campaign - Status:' + taskStatusName + ' - Brand:' + taskName;

                    tasks.push({
                        startDate: d3.time.day.offset(lastEndDate, Math.ceil(Math.random(10))),
                        endDate: d3.time.day.offset(lastEndDate, (Math.ceil(300)) + 1),
                        taskName: taskName,
                        status: taskStatusName,
                        name: name
                    });

                    changeTimeDomain(timeDomainString);
                    gantt.redraw(tasks, timeDomainString);
                }

                function getEndDate() {
                    var lastEndDate = Date.now();

                    if (tasks.length > 0) {
                        lastEndDate = tasks[tasks.length - 1].endDate;
                    }

                    return lastEndDate;
                }

                function prev(timeDomainString) {
                    var td = gantt.timeDomain(),
                        edge1,
                        edge2,
                        tdMonth = moment(td[0]).format('MM'),
                        tdDay = moment(td[0]).format('DD'),
                        qStart,
                        qEnd,
                        fix,
                        firstDay,
                        a,
                        b,
                        diff,

                        data = _.sortBy(tasks, function (o) {
                            return o.start_date;
                        });

                    // force stop scroll on edge
                    if (moment(_.first(data).startDate).toDate() < moment(td[0]).toDate()) {
                        switch (timeDomainString) {
                            case 'quarter':
                                if (tdMonth === 1 || tdMonth === 4 || tdMonth === 7 || tdMonth === 10) {
                                    edge1 = moment(td[0])
                                            .subtract(3, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(2, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                } else {
                                    if (tdMonth >= 1 && tdMonth <= 3) {
                                        // find prev quarter
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

                                    fix = (tdMonth) - (qStart + 1);

                                    edge1 = moment(td[0])
                                            .subtract(fix, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(2, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                }

                                break;

                            case 'year':
                                if (tdMonth !== 1) {
                                    fix = tdMonth - 1;

                                    edge1 = moment(td[0])
                                            .subtract(fix, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(11, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                } else {
                                    edge1 = moment(td[0])
                                            .subtract(12, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(11, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                }

                                break;

                            case 'month':
                                if (tdDay !== 1) {
                                    firstDay = moment(td[0]).startOf('month').format('DD');
                                    fix = (tdDay - firstDay) - 1;

                                    edge1 = moment(td[0])
                                            .subtract(fix + 1, 'days')
                                            .startOf('day')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(30, 'days')
                                            .endOf('day')
                                            .unix() * 1000;
                                } else {
                                    edge1 = moment(td[0])
                                            .subtract(1, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(30, 'days')
                                            .endOf('day')
                                            .unix() * 1000;
                                }

                                break;

                            case 'today':
                                if (moment(_.first(data).startDate).toDate() <
                                    moment(td[0]).subtract(7, 'days').startOf('day').toDate()) {
                                    edge1 = moment(td[0])
                                            .subtract(7, 'days')
                                            .startOf('day')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(6, 'days')
                                            .endOf('day')
                                            .unix() * 1000;
                                } else {
                                    // fix for week view - scroll lock on edges
                                    a = moment(td[0]);
                                    b = moment(_.first(data).startDate);
                                    diff = a.diff(b, 'days');

                                    // set to the minimum date - if less than a week
                                    edge1 = moment(td[0])
                                            .subtract(diff, 'days')
                                            .startOf('day')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(6, 'days')
                                            .endOf('day')
                                            .unix() * 1000;

                                    // disable 'previous' navigation button
                                    navigationButtonControl('#cal_prev', 'disabled');
                                }

                                break;
                        }

                        navigationButtonControl('#cal_next', 'enabled');
                        gantt.timeDomain([edge1, edge2]);
                        gantt.redraw(tasks, timeDomainString);

                        // eager check - navigation lock
                        td = gantt.timeDomain();

                        if (!(moment(_.first(data).startDate).toDate() < // jshint ignore:line
                            moment((td[0] - 1000)).toDate())) {
                            // disable 'previous' navigation button
                            navigationButtonControl('#cal_prev', 'disabled');
                        }
                    } else {
                        // disable 'previous' navigation button
                        navigationButtonControl('#cal_prev', 'disabled');
                    }
                }

                function next(timeDomainString) {
                    var td = gantt.timeDomain(),
                        edge1,
                        edge2,
                        tdMonth = moment(td[0]).format('MM'),
                        tdDay = moment(td[0]).format('DD'),
                        qStart,
                        qEnd,
                        fix,
                        lastDay,

                        data = _.sortBy(tasks, function (o) {
                            return o.start_date;
                        });

                    if (moment(_.first(data).endDate).toDate() > moment(td[1]).toDate()) {
                        if ((moment(_.first(data).endDate).toDate() <
                            moment((td[1] + 1000)).toDate())) {
                            return;
                        }

                        switch (timeDomainString) {
                            case 'quarter':
                                if (tdMonth === 1 || tdMonth === 4 || tdMonth === 7 || tdMonth === 10) {
                                    edge1 = moment(td[0])
                                            .add(3, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(2, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                } else {
                                    if (tdMonth >= 1 && tdMonth <= 3) {
                                        // find next quarter
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

                                    // number of months to next quarter
                                    fix = (qStart + 1) - (tdMonth);

                                    if (qStart === 0) {
                                        fix = 13 - tdMonth;
                                    }

                                    edge1 = moment(td[0])
                                            .add(fix, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(2, 'months')
                                            .endOf('month')
                                            .unix() * 1000;
                                }

                                break;

                            case 'year':
                                if (tdMonth !== 1) {
                                    fix = 13 - tdMonth;

                                    edge1 = moment(td[0])
                                            .add(fix, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(11, 'months')
                                            .endOf('month')
                                            .unix() * 1000;

                                } else {
                                    edge1 = moment(td[0])
                                            .add(12, 'months')
                                            .startOf('month')
                                            .unix() * 1000;

                                    edge2 = moment(edge1)
                                            .add(11, 'months').endOf('month').unix() * 1000;
                                }

                                break;

                            case 'month':
                                lastDay = moment(td[0]).endOf('month').format('DD');
                                fix = lastDay - tdDay;

                                edge1 = moment(td[0])
                                        .add(fix + 1, 'days')
                                        .startOf('day')
                                        .unix() * 1000;

                                edge2 = moment(edge1)
                                        .add(30, 'days')
                                        .endOf('day')
                                        .unix() * 1000;

                                break;

                            case 'today':
                                // get day for weekend
                                // TODO: commented some code for future requirement
                                // edge1 = moment(td[0]).weekday(7).startOf('week').unix() * 1000;
                                // edge2 = moment(edge1).weekday(6).endOf('week').unix() * 1000;

                                edge1 = moment(td[0]).add(7, 'days').startOf('day').unix() * 1000;
                                edge2 = moment(edge1).add(6, 'days').endOf('day').unix() * 1000;
                                break;
                        }

                        navigationButtonControl('#cal_prev', 'enabled');
                        gantt.timeDomain([edge1, edge2]);
                        gantt.redraw(tasks, timeDomainString);

                        // eager check - navigation lock
                        td = gantt.timeDomain();

                        if (!(moment(_.first(data).endDate).toDate() > // jshint ignore:line
                            moment((td[1] + 1000)).toDate())) {
                            // disable 'next' navigation button
                            navigationButtonControl('#cal_next', 'disabled');
                        }
                    } else {
                        // disable 'next' navigation button
                        navigationButtonControl('#cal_next', 'disabled');
                    }
                }

                function navigationButtonControl(id, action) {
                    if (typeof id !== 'undefined' || typeof action !== 'undefined') {
                        switch(action.toLowerCase()) {
                            case 'disabled':
                                $(id).addClass('disabled');
                                break;

                            case 'enabled':
                                $(id).removeClass('disabled');
                                break;
                        }
                    }
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
                    var qStart,
                        qEnd,
                        thisMonth = moment().format('MM'),
                        e,
                        f;

                    switch (timeDomainString) {
                        case '1day':
                            format = '%H:%M';
                            gantt.timeDomain([d3.time.day.offset(getEndDate(), -1), getEndDate()]);
                            break;

                        case '1week':
                            format = '%d';
                            gantt.timeDomain([d3.time.day.offset(getEndDate(), -15), getEndDate()]);
                            break;

                        case 'month':
                            format = '%d';
                            e = moment().startOf('month').startOf('day').unix() * 1000;
                            f = moment(e).add(30, 'days').endOf('day').unix() * 1000;
                            gantt.timeDomain([e, f]);
                            break;

                        case 'today':
                            format = '%d';

                            // monday to sunday
                            gantt.timeDomain(
                                [
                                    moment().startOf('day').subtract(3, 'days'),
                                    moment().endOf('day').add(3, 'days')
                                ]
                            );

                            break;

                        case 'quarter':
                            format = '%d';

                            qStart = 0;
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

                            gantt.timeDomain(
                                [
                                    moment().month(qStart).startOf('month'),
                                    moment().month(qEnd).endOf('month')
                                ]
                            );

                            break;

                        case 'year':
                            format = '%d';
                            gantt.timeDomain([moment().startOf('year'), moment().endOf('year')]);
                            break;

                        default:
                            format = '%H:%M';
                    }

                    // reset navigation
                    navigationButtonControl('#cal_prev', 'enabled');
                    navigationButtonControl('#cal_next', 'enabled');

                    gantt.tickFormat(format);
                    gantt.redraw(tasks, timeDomainString);
                }

                // ********************** IMPLEMENTATION
                function newCalendar(task, taskName, singleBrand) {
                    var calendarHeight = 0,
                        countBrands = 0,

                        margin = {
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 50
                        };

                    tasks = task;
                    taskNames = taskName;

                    taskStatus = {
                        ontrack: 'bar',
                        underperforming: 'bar',
                        paused: 'bar',
                        ready: 'bar',
                        completed: 'bar'
                    };

                    maxDate = tasks[tasks.length - 1].endDate;
                    minDate = tasks[0].startDate;

                    format = '%d';
                    timeDomainString = 'quarter';

                    _.each(tasks, function (t) {
                        if (t.type === 'brand' && t.name !== ' ') {
                            countBrands++;

                            // TODO: recalculation strategy for height
                            calendarHeight += 55;
                        } else {
                            calendarHeight += 25;
                        }
                    });

                    // new height after changing brand placement
                    calendarHeight = calendarHeight - (countBrands * BRAND_PADDING) + (margin.top + margin.bottom + 5);

                    calendarHeight = (calendarHeight > MIN_CALENDAR_HEIGHT) ? calendarHeight : MIN_CALENDAR_HEIGHT;

                    gantt = d3
                        .gantt(calendarHeight)
                        .taskTypes(taskNames)
                        .taskStatus(taskStatus)
                        .tickFormat(format);

                    gantt.isSingleBrand(singleBrand);

                    gantt.margin(margin);
                    gantt.timeDomainMode('fixed');
                    changeTimeDomain(timeDomainString);
                    gantt(tasks, timeDomainString);
                    gantt.redraw(tasks, timeDomainString);
                }

                function updateCalendar(task, taskName) {
                    tasks = task;
                    taskNames = taskName;

                    taskStatus = {
                        ontrack: 'bar',
                        underperforming: 'bar',
                        paused: 'bar',
                        ready: 'bar',
                        completed: 'bar'
                    };

                    timeDomainString = 'today';
                    changeTimeDomain(timeDomainString);
                    gantt.redraw(tasks, timeDomainString);
                }

                function loadMoreItemToCalender(task, taskName, o) {
                    var calendarHeight = 0,
                        countBrands = 0,

                        margin = {
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 50
                        };

                    $('.div-chart > .chart').remove();
                    $('.header-chart').remove();

                    _.each(tasks, function (item, i) {
                        var tempO;

                        if (item.id === vistoconfig.getSelectedBrandId()) {
                            tasks[i].startDate = o.startDate;
                            tasks[i].endDate = o.endDate;

                            if (i) {
                                tempO = $.extend({}, tasks[0]);
                                tasks[0] = $.extend({}, tasks[i]);
                                tasks[i] = $.extend({}, tempO);
                            }
                        }
                    });

                    _.each(task,function (item) {
                        tasks.push(item);
                    });

                    taskNames = taskNames.concat(taskName);

                    taskStatus = {
                        ontrack: 'bar',
                        underperforming: 'bar',
                        paused: 'bar',
                        ready: 'bar',
                        completed: 'bar'
                    };

                    maxDate = tasks[tasks.length - 1].endDate;
                    minDate = tasks[0].startDate;
                    format = '%d';
                    timeDomainString = o.selected;

                    _.each(tasks, function (t) {
                        if (t.type === 'brand' && t.name !== ' ') {
                            countBrands++;

                            // TODO: recalculation strategy for height
                            calendarHeight += 55;
                        } else {
                            calendarHeight += 31;
                        }
                    });

                    // new height after changing brand placement
                    calendarHeight = calendarHeight - (countBrands * BRAND_PADDING) + (margin.top + margin.bottom + 5);

                    calendarHeight = (calendarHeight > MIN_CALENDAR_HEIGHT) ? calendarHeight : MIN_CALENDAR_HEIGHT;

                    gantt = d3
                        .gantt(calendarHeight)
                        .taskTypes(taskNames)
                        .taskStatus(taskStatus)
                        .tickFormat(format);

                    gantt.isSingleBrand(true);
                    gantt.margin(margin);
                    gantt.timeDomainMode('fixed');
                    changeTimeDomain(timeDomainString);
                    gantt(tasks, timeDomainString);
                    gantt.redraw(tasks, timeDomainString);
                }

                d3.gantt = function (calHeight) {
                    var FIT_TIME_DOMAIN_MODE = 'fit',
                        CAMPAIGN_HEIGHT = 25,
                        CALENDAR_HEIGHT = (calHeight === undefined) ? MIN_CALENDAR_HEIGHT : calHeight,
                        CALENDAR_WIDTH = 1300,
                        isSingleBrand = false,

                        margin = {
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 50
                        },

                        tDomainString = '',
                        onTrackColor = '#47ab1d',
                        underperformingColor = '#ee9455',
                        noStatusColor = '#939eae',
                        timeDomainStart = d3.time.day.offset(new Date(), -300),
                        timeDomainEnd = d3.time.hour.offset(new Date(), +300),
                        timeDomainMode = FIT_TIME_DOMAIN_MODE,
                        taskTypes = [],
                        taskStatus = [],
                        height = CALENDAR_HEIGHT - margin.top - margin.bottom + 20,
                        width = CALENDAR_WIDTH - margin.right - margin.left - 5,

                        // for drag and panning
                        selection = selection || d3.select('body'),

                        tickFormat = '%d',

                        keyFunction = function (d) {
                            return d.startDate + d.taskName + d.endDate;
                        },

                        rectTransform = function (d) {
                            return 'translate(' + x(d.startDate) + ',' + y(d.taskName) + ')';
                        },

                        shift = { counter: 0 },

                        brandTransform = function (d) {
                            return 'translate(0,' + (y(d.taskName) - calculateBrandAdjustment(d, shift)) + ')';
                        },

                        markerTransform = function () {
                            var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                            if (width <= 40) {
                                return 'translate(' + x(moment().endOf('day')) + ',-20)';
                            }

                            return 'translate(' + x(moment().startOf('day')) + ',-20)';
                        },

                        /**
                         * calculate adjustment pixels
                         * @param campaignObj - campaign object
                         * @param counterObj - counter object
                         * @return number padding - new adjustment pixels
                         */
                        calculateBrandAdjustment= function (campaignObj, counterObj) {
                            if (campaignObj.type === 'brand') {
                                counterObj.counter++;
                            }
                            return counterObj.counter * BRAND_PADDING;
                        },

                        x = d3
                            .time
                            .scale()
                            .domain([timeDomainStart, timeDomainEnd])
                            .range([0, width])
                            .clamp(true),

                        y = d3
                            .scale
                            .ordinal()
                            .domain(taskTypes)
                            .rangeRoundBands([0, 450]),

                    // TODO - add scroll
                    // d3.scale.ordinal().domain(taskTypes).rangeRoundBands(
                    // [ 0, height - margin.top - margin.bottom ], .1);

                        xAxis = d3
                            .svg
                            .axis()
                            .scale(x).orient('top')
                            .tickFormat(function (d) {
                                // TODO: Why is count a global variable? (Lalding: 8th July 2016)
                                count++; // jshint ignore:line

                                // if first - show date and month,
                                // if 1st day of month - show month, day
                                // if other views - quarter, year, month
                                // year - show month - year for 1st
                                if (count === 1) { // jshint ignore:line
                                    return formatMonth(d); // jshint ignore:line
                                } else {
                                    return formatDay(d); // jshint ignore:line
                                }
                            })
                            .ticks(d3.time.days, 1)
                            .tickSize(height - margin.top, height - margin.top)
                            .tickPadding(-15),

                        yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0),

                        initTimeDomain = function (tasks) {
                            if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
                                if (tasks === undefined || tasks.length < 1) {
                                    timeDomainStart = d3.time.day.offset(new Date(), -3);
                                    timeDomainEnd = d3.time.hour.offset(new Date(), +3);

                                    return;
                                }

                                timeDomainEnd = tasks[tasks.length - 1].endDate;
                                timeDomainStart = tasks[0].startDate;
                            }
                        },

                        initAxis = function (timeDomainString) {
                            var range = tasks.length * 15,
                                formatDay,
                                formatMonth,
                                formatQuarter,
                                formatMonthOnly,
                                count,
                                tickType;

                            x = d3
                                .time
                                .scale()
                                .domain([timeDomainStart, timeDomainEnd])
                                .range([0, width])
                                .clamp(true)
                                .nice(d3.time.day);

                            y = d3
                                .scale
                                .ordinal()
                                .domain(taskTypes)
                                .rangeRoundBands([0, range]);

                            formatDay = d3.time.format('%d');
                            formatMonth = d3.time.format('%b %d');

                            formatQuarter = d3.time.format('%b %y');
                            formatMonthOnly = d3.time.format('%b');
                            count = 0;
                            tickType = d3.time.days;

                            switch (timeDomainString) {
                                case 'quarter':
                                case 'year':
                                    tickType = d3.time.months;
                            }

                            xAxis = d3
                                .svg
                                .axis()
                                .scale(x).orient('top')
                                .tickFormat(function (d) {
                                    count++;

                                    // if first - show date and month,
                                    // if 1st day of month - show month, day
                                    // if other views - quarter, year, month
                                    // year - show month - year for 1st
                                    if (timeDomainString === 'month' ||
                                        timeDomainString === 'today' ||
                                        timeDomainString === 'week') {
                                        if (count === 1 || moment(d).format('D') === 1) {
                                            return formatMonth(d);
                                        } else {
                                            return formatDay(d);
                                        }
                                    } else {
                                        // year or quarter
                                        if (count === 1) {
                                            return formatQuarter(d);
                                        } else {
                                            return formatMonthOnly(d);
                                        }
                                    }
                                })
                                .ticks(tickType, 1)
                                .tickSize(height - margin.top, height - margin.top)

                                // modified from 8
                                .tickPadding(-30);

                            yAxis = d3
                                .svg.axis()
                                .scale(y)
                                .orient('left')
                                .tickFormat('')
                                .tickSize(0);
                        };

                    function gantt(tasks, timeDomainString) {
                        var svg,
                            svgHeader;

                        $('#calendarHolder').css({'opacity':'0'});
                        $('.div-header-chart .header-chart, svg.chart').remove();

                        setTimeout(function () {
                            //$('#calendarHolder').show();
                            $('#calendarHolder').css({'opacity':'1'});
                        }, 300);

                        initTimeDomain(tasks);
                        initAxis(timeDomainString);

                        svgHeader = d3
                            .select('#calendar_widget')
                            .select('.div-header-chart')
                            .style('position','absolute')
                            .style('top','0px')
                            .style('left','24px')
                            .append('svg')

                            // TODO - check if needed for cross browser support
                            // .attr({xmlns: 'http://www.w3.org/2000/svg',
                            //        xlink: 'http://www.w3.org/1999/xlink',
                            //    })

                            .attr('class', 'header-chart')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', 47)
                            .append('g')
                            .attr('class', 'gantt-chart-head')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', 47)
                            .attr('transform', 'translate(0, ' + margin.top + ')');

                        svg = d3
                            .select('#calendar_widget')
                            .select('.div-chart')
                            .append('svg')

                            // TODO - check if needed for cross browser support
                            // .attr({xmlns: 'http://www.w3.org/2000/svg',
                            //        xlink: 'http://www.w3.org/1999/xlink',
                            //    })

                            .attr('class', 'chart')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', height - margin.top - margin.bottom)
                            .append('g')
                            .attr('class', 'gantt-chart')
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', height + margin.top + margin.bottom)
                            .attr('transform', 'translate(0, ' + margin.top + ')');

                        // changing rendering order to fix day marker under tick text
                        svg.append('rect').attr('class', 'marker');
                        svg.append('rect').attr('class', 'marker_body');

                        svgHeader.append('rect').attr('class', 'header_background');
                        svgHeader.append('rect').attr('class', 'marker');
                        svgHeader.append('rect').attr('class', 'marker_body');

                        svgHeader
                            .append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
                            .transition()
                            .call(xAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-family:Avenir;font-size:14px;')
                            .attr('x', function () {
                                return 10;
                            });

                        svgHeader.append('g').attr('class', 'y axis').transition().call(yAxis);

                        svg
                            .append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
                            .transition()
                            .call(xAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-family:Avenir;font-size:14px;')
                            .attr('x', function () {
                                return 10;
                            });

                        svg.append('g').attr('class', 'y axis').transition().call(yAxis);

                        svgHeader.append('line').attr('class', 'axis_top');
                        svgHeader.append('line').attr('class', 'axis_bottom');

                        gantt.draw(tasks, timeDomainString);

                        svg.append('rect').attr('class', 'date_marker');

                        return gantt;
                    }

                    gantt.draw = function (tasks, timeDomainString) {
                        var svg = d3.select('#calendar_widget').select('svg.chart'),
                            svgHeader = d3.select('#calendar_widget').select('svg.header-chart'),
                            dragInitiated = false,
                            tdEdges,
                            isPast,
                            isFuture,
                            isPastView,
                            isFutureView,
                            counterObj,
                            ganttChartGroup,
                            ganttChartHeaderGroup,
                            mark,
                            markerData,
                            markerGroup,
                            pastMarkerTextX,
                            rect,
                            rectData,
                            rectGroup,
                            node,
                            campaignBody,
                            campaignText,
                            brandNameText,
                            campaignTopStroke,
                            campaignsStatusIcon,
                            nodeMarker,
                            markers,
                            pastMarkerText,
                            pastMarkerTextDetails,
                            campaignsBottomStroke,
                            translateVisualElements,
                            translateGraphicElements;

                        tDomainString = timeDomainString;

                        svg
                            .on('mousedown.zoom', null)
                            .on('touchstart.zoom', null)
                            .on('touchmove.zoom', null)
                            .on('touchend.zoom', null);

                        svg.call(
                            d3
                                .behavior
                                .drag()
                                .on('dragstart', function () {
                                    // prevent other initiations like right click
                                    if (d3.event.sourceEvent.which === 1) {
                                        // if source is mouse drag
                                        dragInitiated = true;
                                    }

                                    d3.event.sourceEvent.stopPropagation();
                                })
                                .on('drag', function () {
                                    var td,
                                        scale,
                                        data;

                                    if (dragInitiated) {
                                        td = gantt.timeDomain();
                                        scale = (td[1]-td[0])/1000;

                                        data = _.sortBy(tasks, function (o) {
                                            return o.start_date;
                                        });

                                        d3.event.sourceEvent.stopPropagation();

                                        if (d3.event.dx < 0) {
                                            if (moment(_.first(data).endDate).toDate() >
                                                moment(td[1]).toDate()) {
                                                if (moment(_.first(data).endDate).toDate() >
                                                    moment(td[1] - scale *
                                                        d3.event.dx).toDate()) {
                                                    gantt.timeDomain([td[0] - scale *
                                                    d3.event.dx, td[1] - scale *
                                                    d3.event.dx]);
                                                } else if (
                                                    moment(_.first(data).endDate).toDate() <
                                                    moment(td[1] - scale / 10)
                                                ) {
                                                    gantt.timeDomain([td[0] - scale/10 , td[1] - scale / 10]);
                                                } else {
                                                    navigationButtonControl('#cal_next', 'disabled');
                                                }
                                            } else {
                                                navigationButtonControl('#cal_next', 'disabled');
                                            }

                                            // if user requests next duration data -  scroll the view
                                            gantt.redraw(tasks, timeDomainString);
                                            navigationButtonControl('#cal_prev', 'enabled');
                                        } else if (moment(_.first(data).startDate).toDate() <
                                            moment(td[0]).toDate()) {
                                            // if user asks for previous period data - check if available
                                            if (moment(_.first(data).startDate).toDate() <
                                                moment((td[0] - scale *
                                                d3.event.dx)).toDate()) {
                                                // second line of defence to limit scroll to previous duration
                                                // based on the amount of drag :)
                                                gantt.timeDomain([td[0] - scale * d3.event.dx,
                                                    td[1] - scale * d3.event.dx]);
                                            } else {
                                                // do a partial scroll to reach dead edge
                                                gantt.timeDomain([td[0] - scale , td[1] - scale]);
                                            }

                                            gantt.redraw(tasks, timeDomainString);
                                            navigationButtonControl('#cal_next', 'enabled');
                                        } else {
                                            // disable 'previous' navigation button
                                            navigationButtonControl('#cal_prev', 'disabled');
                                        }

                                    }
                                    // dragInitiated check ends
                                })
                                .on('dragend', function () {
                                        if (d3.event.sourceEvent.which === 1) {
                                            // end the drag check
                                            dragInitiated = false;
                                        }

                                        d3.event.sourceEvent.stopPropagation();
                                    }
                                )
                        );

                        tdEdges = gantt.timeDomain();

                        isPast = function (timeDomainEdge, date) {
                            if (moment(timeDomainEdge).toDate() <= moment(date).toDate()) {
                                return true;
                            } else {
                                return false;
                            }
                        };

                        isFuture = function (timeDomainEdge, date) {
                            if (moment(timeDomainEdge).toDate() >= moment(date).toDate()) {
                                return true;
                            } else {
                                return false;
                            }
                        };

                        /**
                         * Check if campaign is in the PAST view of the calendar timeline
                         *
                         * @param calendarStart The start date of calendar timeline
                         * @param campaignStartDate
                         * @param campaignEndDate
                         * @return bool True if it is in the past
                         *              False if it is not
                         */
                        isPastView = function (calendarStart, campaignStartDate, campaignEndDate) {
                            if (moment(calendarStart).toDate() >=
                                moment(campaignEndDate).toDate()) {
                                return true;
                            } else {
                                return false;
                            }
                        };

                        /**
                         * Check if campaign is in the FUTURE view of the calendar timeline
                         *
                         * @param calendarEnd The end date of calendar timeline
                         * @param campaignStartDate
                         * @return bool True if it is in the future
                         *              False if it is not
                         */
                        isFutureView = function (calendarEnd, campaignStartDate) {
                            if (moment(calendarEnd).toDate() <=
                                moment(campaignStartDate).toDate()) {
                                return true;
                            } else {
                                return false;
                            }
                        };

                        // recalculation for rendering - counters for elements
                        counterObj = {
                            body: { counter: 0 },
                            marker: {counter: 0 },
                            icon: {counter: 0 },
                            top: {counter: 0 },
                            text: {counter: 0 },
                            strokeY1: {counter: 0 },
                            strokeY2: {counter: 0 },
                            iconTooltip: {counter: 0 }
                        };

                        ganttChartGroup = svg.select('.gantt-chart');
                        ganttChartHeaderGroup = svgHeader.select('.gantt-chart-head');

                        // axis top line
                        ganttChartHeaderGroup.selectAll('line.axis_top')
                            .style('stroke', '#ccd2da')
                            .attr('x1', 0)
                            .attr('y1', -20)
                            .attr('x2', width)
                            .attr('y2', -20)
                            .style('fill', 'none')
                            .style('shape-rendering', 'crispEdges');

                        // HEADER BACKGROUND
                        ganttChartHeaderGroup.selectAll('rect.header_background')
                            .style('stroke', '#fff')
                            .attr('x', 0)
                            .attr('y', -20)
                            .attr('width', width)
                            .attr('height', 46)
                            .style('fill', '#fff')
                            .style('shape-rendering', 'crispEdges');

                        // axis second line
                        // TODO: add Vertical gradient from #939ead to #e9ebee. Opacity 0.3
                        ganttChartHeaderGroup.selectAll('line.axis_bottom')
                            .style('stroke', '#ccd2da')
                            .attr('x1', 0)
                            .attr('y1', 26)
                            .attr('x2', width)
                            .attr('y2', 26)
                            .style('fill', 'none')
                            .style('stroke-width', '1')
                            .style('shape-rendering', 'crispEdges');

                        markerData = ganttChartGroup.selectAll('.node-marker').data(tasks, keyFunction);
                        mark = markerData.enter();
                        markerGroup = mark.append('g').attr('class', 'node-marker');

                        // new marker
                        markerGroup
                            .append('image')
                            .attr('y', function () {
                                return 7;
                            })
                            .attr('xlink:href', function (d) {
                                var direction = 'none';

                                if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                    direction = 'left';

                                    if (d.kpiStatus === 'ontrack') {
                                        return window.assets.green_left;
                                    } else if (d.kpiStatus === 'underperforming') {
                                        return window.assets.orange_left;
                                    } else {
                                        return window.assets.gray_left;
                                    }
                                } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                    direction = 'right';

                                    if (d.kpiStatus === 'ontrack') {
                                        return window.assets.green_right;
                                    } else if (d.kpiStatus === 'underperforming') {
                                        return window.assets.orange_right;
                                    } else {
                                        return window.assets.gray_right;
                                    }
                                }
                            })
                            .attr('class', 'past-marker')
                            .attr('style', 'cursor:pointer')
                            .style('shape-rendering', 'crispEdges')
                            .attr('width', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else if (d.kpiStatus === 'ontrack' ||
                                    d.kpiStatus === 'underperforming' ||
                                    d.kpiStatus === 'NA' ||
                                    d.kpiStatus === undefined ||
                                    d.kpiStatus === 'Unknown') {
                                    if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                        return 25;
                                    } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                        return 25;
                                    } else {
                                        return 0;
                                    }
                                } else {
                                    return 0;
                                }
                            })
                            .on('click', function (d) {
                                var e,
                                    f;

                                switch(tDomainString) {
                                    case 'year':
                                        e = moment(d.startDate)
                                                .startOf('year')
                                                .startOf('day')
                                                .unix() * 1000;

                                        f = moment(e)
                                                .add(1, 'year')
                                                .unix() * 1000;

                                        break;

                                    case 'month':
                                        e = moment(d.startDate)
                                                .startOf('month')
                                                .startOf('day')
                                                .unix() * 1000;

                                        f = moment(e)
                                                .add(31, 'days')
                                                .endOf('day')
                                                .unix() * 1000;

                                        break;

                                    case 'quarter':
                                        e = moment(d.startDate)
                                                .startOf('quarter')
                                                .startOf('day')
                                                .unix() * 1000;

                                        f = moment(e)
                                                .add(1, 'quarters')
                                                .unix() * 1000;

                                        break;

                                    case 'today':
                                        e = moment(d.startDate)
                                                .startOf('week')
                                                .startOf('day')
                                                .unix() * 1000;

                                        f = moment(e)
                                                .add(1, 'weeks')
                                                .endOf('day')
                                                .unix() * 1000;

                                        break;
                                }

                                // scroll navigation reset
                                navigationButtonControl('#cal_next', 'enabled');
                                navigationButtonControl('#cal_prev', 'enabled');
                                gantt.timeDomain([e, f]);
                                gantt.redraw(tasks, tDomainString);
                            })
                            .attr('height', CAMPAIGN_HEIGHT/2)
                            .on('mouseover', function (d) {
                                // select the marker tooltip's date text and make it visible
                                var container,
                                    tdEdges,
                                    bbox,
                                    textWidth,
                                    offset,
                                    containerWidth,
                                    im,

                                    containerPrimary = d3
                                        .select(this.parentNode)
                                        .select('text.past-marker-text');

                                containerPrimary.style('display', function () {
                                    return 'block';
                                });

                                containerPrimary.style('shape-rendering', 'crispEdges');

                                // select the marker tooltip's details text and make it visible
                                container = d3
                                    .select(this.parentNode)
                                    .select('text.past-marker-text-details');

                                container.style('display', function () {
                                    return 'block';
                                });

                                tdEdges = gantt.timeDomain();

                                if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                    // if right marker - calculate position
                                    bbox = 0;
                                    textWidth = 0;
                                    offset = 0;
                                    containerWidth = 465;

                                    // get width of the text by using BBox's width
                                    bbox = container.node().getBBox();
                                    textWidth = bbox.width;

                                    // width of the text container which holds date
                                    bbox = containerPrimary.node().getBBox();

                                    // padding after date text
                                    offset = bbox.width + 5;

                                    textWidth += bbox.width;

                                    containerPrimary.attr('x', function () {
                                        // place the tooltip to end it near the marker based on the container
                                        return containerWidth - textWidth;
                                    });

                                    container.attr('x', function () {
                                        // place the tooltip details after giving some padding
                                        return containerWidth - textWidth + offset;
                                    });
                                }

                                im = d3.select(this);

                                im
                                    .attr('xlink:href', function (d) {
                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            if (d.kpiStatus === 'ontrack') {
                                                return window.assets.green_left_act;
                                            } else if (d.kpiStatus === 'underperforming') {
                                                return window.assets.orange_left_act;
                                            } else {
                                                return window.assets.gray_left_act;
                                            }
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            if (d.kpiStatus === 'ontrack') {
                                                return window.assets.green_right_act;
                                            } else if (d.kpiStatus === 'underperforming') {
                                                return window.assets.orange_right_act;
                                            } else {
                                                return window.assets.gray_right_act;
                                            }
                                        }
                                    });
                            })
                            .on('mouseout', function () {
                                var container = d3
                                        .select(this.parentNode)
                                        .select('text.past-marker-text'),

                                    im,
                                    tdEdges;

                                container.style('display', function () {
                                    return 'none';
                                });

                                container = d3.
                                    select(this.parentNode)
                                    .select('text.past-marker-text-details');

                                container.style('display', function () {
                                    return 'none';
                                });

                                im = d3.select(this);
                                tdEdges = gantt.timeDomain();

                                im.attr('xlink:href', function (d) {
                                    if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                        if (d.kpiStatus === 'ontrack') {
                                            return window.assets.green_left;
                                        } else if (d.kpiStatus === 'underperforming') {
                                            return window.assets.orange_left;
                                        } else {
                                            return window.assets.gray_left;
                                        }
                                    } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                        if (d.kpiStatus === 'ontrack') {
                                            return window.assets.green_right;
                                        } else if (d.kpiStatus === 'underperforming') {
                                            return window.assets.orange_right;
                                        } else {
                                            return window.assets.gray_right;
                                        }
                                    }
                                });
                            });

                        pastMarkerTextX = 30;

                        markerGroup
                            .append('text')
                            .attr('class', 'past-marker-text')
                            .attr('x', pastMarkerTextX)
                            .attr('fill','#939ead')
                            .attr('dy', '.35em')
                            .attr('font-family', 'Avenir')
                            .attr('style', function () {
                                return 'display:none';
                            })
                            .attr('stroke-width', '0.3')
                            .attr('stroke', '#939ead')
                            .text(function (d) {
                                if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                    pastMarkerText = moment(d.startDate).format('DD MMM') +
                                        '-' + moment(d.endDate).format('DD MMM') + ' ';
                                    return pastMarkerText;
                                } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                    pastMarkerText = moment(d.startDate).format('DD MMM') +
                                        '-' + moment(d.endDate).format('DD MMM') +' ';

                                    return pastMarkerText;
                                }
                            });

                        markerGroup.append('text')
                            .attr('class', 'past-marker-text-details')
                            .attr('x', function () {
                                var container = d3
                                    .select(this.parentNode)
                                    .select('text.past-marker-text'),
                                    offset = 54,
                                    padding = 16,
                                    textWidth,
                                    bbox;

                                // temporarily disable element on DOM to get width
                                container.style('display', function () {
                                    return 'block';
                                });

                                // get width of text element using BBox
                                bbox = container.node().getBBox();

                                // add offset and padding
                                textWidth = pastMarkerTextX + (pastMarkerText ? pastMarkerText.length : 0) +
                                    offset + padding;

                                // hide the tooltip content
                                container.style('display', function () {
                                    return 'none';
                                });

                                // return corrected rendering location
                                return textWidth;
                            })
                            .attr('fill','#21252b')
                            .attr('dy', '.35em')
                            .attr('font-family', 'Avenir')
                            .attr('style', function () {
                                return 'display:none';
                            })
                            .attr('stroke-width', '0.3')
                            .attr('stroke', '#21252b')
                            .text(function (d) {
                                if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                    return  d.name;
                                } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                    return d.name;
                                }
                            });

                        rectData = ganttChartGroup.selectAll('.node').data(tasks, keyFunction);
                        rect = rectData.enter();

                        rectGroup = rect
                            .append('a')
                            .attr('xlink:href', function (d) {
                                if (d.type === 'brand') {
                                    return 'javascript:void(0)'; // jshint ignore:line
                                } else {
                                    var url = '/a/' + $routeParams.accountId;
                                    if ($routeParams.subAccountId) {
                                        url += '/sa/' + d.client_id;
                                    } else {
                                        url = '/a/' + d.client_id;
                                    }

                                    url += '/adv/' + d.advertiser_id + '/b/' + (d.brand_id || 0);
                                    url += '/mediaplans/' + d.id + '/overview';
                                    return url;
                                }
                            })
                            .style('text-decoration', 'none')
                            .on('click', function () {
                                d3.event.preventDefault();
                            })
                            .append('g').attr('class', 'node')
                            .on('click', function (d) {
                                if (d.type !== 'brand') {
                                    // on ^ + click / ⌘ + click - (supported keys)  d3.event.shiftKey, d3.event.altKey
                                    var url = '/a/' + $routeParams.accountId;
                                    if ($routeParams.subAccountId) {
                                        url += '/sa/' + d.client_id;
                                    } else {
                                        url = '/a/' + d.client_id;
                                    }

                                    url += '/adv/' + d.advertiser_id + '/b/' + (d.brand_id || 0);
                                    url += '/mediaplans/' + d.id + '/overview';

                                    if (d3.event.ctrlKey || d3.event.metaKey) {
                                        // on supported key combination and click open in new tab
                                        $window.open(url);
                                    } else {
                                        // on normal click open link in current tab
                                        $location.url(url);
                                    }

                                    // TODO we need to remove this, added because of removing the hashtag
                                    $rootScope.$apply();
                                }
                            })

                            // on mouseover tanstitions for campaigns
                            // resize and display the campaign text
                            .on('mouseover', function (d) {
                                var icon,
                                    container,
                                    width = (x(d.endDate) - x(d.startDate)),

                                // character count of the camapaign name
                                    stringLength = d.name.length,

                                // considering each character takes 12px
                                    newWidth = stringLength * 12;

                                // if qualifying element
                                // if width below a limit
                                // calculate the width of container and  re populate the text
                                if (d.type !== 'brand') {
                                    if (newWidth > width) {
                                        // icon - check if it fits the display criteria
                                        icon = d3.select(this).select('image.icon');

                                        icon.style('display', function (d) {
                                            if ((x(d.endDate) - x(d.startDate)) > 0) {
                                                return 'block';
                                            } else {
                                                return 'none';
                                            }
                                        });

                                        // check if text fits the display criteria
                                        container = d3.select(this).select('text.campaigns_name');

                                        container.style('display', function (d) {
                                            if ((x(d.endDate) - x(d.startDate)) > 0) {
                                                return 'block';
                                            } else {
                                                return 'none';
                                            }
                                        });

                                        container.text(function (d) {
                                            return d.name;
                                        });
                                    }
                                }
                            })

                            .on('mouseout', function (d) {
                                var width = (x(d.endDate) - x(d.startDate)),
                                    stringLength = d.name.length,
                                    fitCount,
                                    icon,
                                    container;

                                if (d.type !== 'brand') {
                                    if (width > 25) {
                                        // minimum width to fit in the icon
                                        width = Math.abs(25 - width);
                                    }

                                    // considering approx. of 10px for a character
                                    fitCount = width / 7;

                                    // check if there is space to render icon - if not hide it
                                    icon = d3.select(this).select('image.icon');

                                    icon.style('display', function (d) {
                                        if ((x(d.endDate) - x(d.startDate)) <= 40) {
                                            return 'none';
                                        } else {
                                            return 'block';
                                        }

                                    });

                                    // check if text is supposed to be visible - if not hide
                                    container = d3.select(this).select('text.campaigns_name');

                                    container.style('display', function (d) {
                                        if ((x(d.endDate) - x(d.startDate)) <= 40) {
                                            return 'none';
                                        } else {
                                            return 'block';
                                        }
                                    });

                                    container.text(function (d) {
                                        if (fitCount >= stringLength) {
                                            // texts fits :)
                                            return d.name;
                                        } else {
                                            return d.name.substr(0, fitCount) + '...';
                                        }
                                    });
                                }
                            });

                        // brand grouping
                        rectGroup
                            .append('text')
                            .attr('class', 'brand_name')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('dy', '.35em')
                            .attr('font-size', '20px')
                            .attr('cursor', 'default')
                            .attr('font-weight', '900')
                            .attr('fill', '#21252b')
                            .attr('font-family', 'Avenir')
                            .attr('style', function (d) {
                                if (d.type === 'brand') {
                                    return '';
                                } else {
                                    return 'display:none';
                                }
                            })
                            .text(function (d) {
                                return d.name;
                            })
                            .transition()
                            .attr('transform',brandTransform);
                        // brand grouping ends

                        // top bar
                        rectGroup
                            .append('rect')
                            .attr('x', 0)
                            .attr('class', 'header')
                            .attr('style', 'cursor:pointer')
                            .style('shape-rendering', 'crispEdges')
                            .attr('fill', function (d) {
                                if (d.kpiStatus === 'ontrack') {
                                    return onTrackColor;
                                } else if (d.kpiStatus === 'underperforming') {
                                    return underperformingColor;
                                } else {
                                    return noStatusColor;
                                }
                            })
                            .attr('width', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else if (d.kpiStatus === 'ontrack' ||
                                    d.kpiStatus === 'underperforming' ||
                                    d.kpiStatus === 'NA' ||
                                    d.kpiStatus === undefined ||
                                    d.kpiStatus === 'Unknown') {
                                    return (x(d.endDate) - x(d.startDate));
                                } else {
                                    return 0;
                                }
                            })
                            .attr('height', CAMPAIGN_HEIGHT)
                            .transition().delay(0)
                            .attr('transform', rectTransform);

                        rectGroup.append('rect')
                            .attr('x', 0)
                            .attr('y', 2)
                            .attr('id', function (d, i) {
                                return 'campaign-' + i;
                            })
                            .attr('class', 'text_container')
                            .attr('style', 'cursor:pointer')
                            .attr('class', function (d) {
                                if (taskStatus[d.kpiStatus] === undefined || taskStatus[d.kpiStatus] === null) {
                                    return 'bar campaigns';
                                }

                                return taskStatus[d.kpiStatus] + ' campaigns';
                            })
                            .attr('width', function (d) {
                                var width;

                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    width = (x(d.endDate) - x(d.startDate));

                                    if (width >= 0) {
                                        return (width);
                                    } else {
                                        return 0;
                                    }
                                }
                            })
                            .attr('height', function () {
                                return CAMPAIGN_HEIGHT - 2;
                            })
                            .transition().delay(0)
                            .attr('transform', rectTransform);

                        // Stroke - Bottom for the campaign (1px #ccd2da)
                        rectGroup
                            .append('line')
                            .attr('class', 'campaign_stroke')
                            .attr('x1', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    return 0;
                                }
                            })
                            .attr('y1', function (d) {
                                var padding = calculateBrandAdjustment(d, counterObj.strokeY1);

                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    return y(d.taskName) + CAMPAIGN_HEIGHT - padding;
                                }
                            })
                            .attr('y2', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    return y(d.taskName) + CAMPAIGN_HEIGHT;
                                }
                            })
                            .attr('x2', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    return x(d.endDate) - x(d.startDate) + 2;
                                }
                            })
                            .style('stroke', '#ccd2da')
                            .style('stroke-width', '1px')
                            .style('shape-rendering', 'crispEdges');

                        rectGroup.append('text')
                            .attr('class', 'campaigns_name')
                            .attr('x', 30)
                            .attr('y', CAMPAIGN_HEIGHT / 2)
                            .attr('dy', '.35em')
                            .attr('font-family', 'Avenir')
                            .attr('style', function (d) {
                                if (d.type === 'brand') {
                                    return 'display:none';
                                } else if ((x(d.endDate) - x(d.startDate)) !== 0) {
                                    return 'cursor:pointer';
                                } else {
                                    return 'display:none';
                                }
                            })
                            .text(function (d) {
                                var fitCount,

                                    // width of the container
                                    width = (x(d.endDate) - x(d.startDate)),

                                    // character count of the camapaign name
                                    stringLength = d.name.length;

                                if (width > 25) {
                                    // minimum width to fit in the icon
                                    width = Math.abs(25 - width);
                                }

                                // considering approx. of 10px for a character
                                fitCount = width / 7;

                                if (fitCount >= stringLength) {
                                    // texts fits :)
                                    return d.name;
                                } else {
                                    return d.name.substr(0, fitCount) + '...';
                                }
                            })
                            .transition()
                            .attr('transform', rectTransform);

                        rectGroup.append('image')
                            .attr('class', 'icon')
                            .attr('x', CAMPAIGN_HEIGHT / 3)
                            .attr('y', CAMPAIGN_HEIGHT / 5)
                            .attr('height', CAMPAIGN_HEIGHT - 11)
                            .attr('width', function (d) {
                                if (d.type === 'brand') {
                                    return 0;
                                } else if ((x(d.endDate) - x(d.startDate)) !== 0) {
                                    return 13;
                                } else {
                                    return 0;
                                }
                            })
                            .attr('xlink:href', function (d) {
                                switch (d.state) {
                                    case 'Active':
                                        return window.assets.statusbulb_active;
                                    case 'Paused':
                                        return window.assets.statusbulb_paused;
                                    case 'Draft':
                                        return window.assets.statusbulb_draft;
                                    case 'Ready':
                                        return window.assets.statusbulb_ready;
                                    case 'Ended':
                                        return window.assets.statusbulb_completed;
                                    case 'In_flight':
                                        return window.assets.statusbulb_inflight;
                                }
                            })
                            .on('mouseover', function (d) {
                                var flag = false,
                                    padding,
                                    xPosition,
                                    yPosition,
                                    classTooltip;

                                // reset counter
                                counterObj.iconTooltip.counter = 0;

                                _.each(tasks, function (t) {
                                    if (!flag && t.type === 'brand') {
                                        counterObj.iconTooltip.counter++;
                                    }

                                    if (d.id === t.id) {
                                        // break flag to stop counting -adjustment multiplier
                                        flag = true;
                                    }
                                });

                                // calculate correction for the tooltip placement
                                padding= counterObj.iconTooltip.counter * BRAND_PADDING;

                                // mouseover on icon - display tooltip
                                xPosition = x(d.startDate) - 15;
                                yPosition = (y(d.taskName) * 2) - 15 - padding;
                                classTooltip = '.calendar_tooltip';

                                if (d.state.toLowerCase() === 'completed') {
                                    $('.calendar_tooltip').addClass('calendar_tooltip_left');
                                    classTooltip = '.calendar_tooltip_left';
                                } else if ($('.calendar_tooltip_left')[0]) {
                                    $('.calendar_tooltip').removeClass('calendar_tooltip_left');
                                }

                                if (d.state === 'In_flight') {
                                    d.state = 'In Flight';
                                }

                                d3
                                    .select(classTooltip)
                                    .style('display', 'block')
                                    .style('left', xPosition + 'px')
                                    .style('top', yPosition + 'px')
                                    .text(d.state);
                            })
                            .on('mouseout', function () {
                                // mouseout on icon - hide tooltip
                                d3
                                    .select('.calendar_tooltip')
                                    .style('display', 'none');
                            })
                            .transition()
                            .attr('transform', rectTransform);

                        // today marker
                        ganttChartHeaderGroup
                            .select('rect.marker')
                            .attr('x', 0)
                            .attr('y', 1)
                            .attr('class', 'marker')
                            .attr('fill', function () {
                                var width
                                    = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 0) {
                                    return 'none';
                                } else if (width <= 40) {
                                    if (timeDomainString === 'today') {
                                        return 'none';
                                    }

                                    return '#74AFDD';
                                } else {
                                    return '#e7edf1';
                                }
                            })
                            .attr('width', function () {
                                var width =
                                    (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 0) {
                                    width = 0;
                                } else if (width <= 40) {
                                    // 2
                                    width = 0;
                                }

                                return width;
                            })
                            .attr('height', function () {
                                var width =
                                    (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    // height - margin.top
                                    return 0;
                                } else {
                                    return 4;
                                }
                            })
                            .transition()
                            .attr('transform', markerTransform);

                        // body-header
                        ganttChartHeaderGroup
                            .select('rect.marker_body')
                            .attr('x', 0)
                            .attr('y', 4)
                            .attr('class', 'marker_body')
                            .attr('fill', '#f5f9fd')
                            .attr('width', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    width = 0;
                                }

                                return width;
                            })
                            .attr('height', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    return 0;
                                } else {
                                    return height - margin.top;
                                }
                            })
                            .transition()
                            .attr('transform', markerTransform);

                        // body
                        ganttChartGroup
                            .select('rect.marker_body')
                            .attr('x', 0)
                            .attr('y', 4)
                            .attr('class', 'marker_body')
                            .attr('fill', '#f5f9fd')
                            .attr('width', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    width = 0;
                                }

                                return width;
                            })
                            .attr('height', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    return 0;
                                } else {
                                    return height - margin.top;
                                }
                            })
                            .transition()
                            .attr('transform', markerTransform);

                        // for year, quarter, month - marker
                        ganttChartGroup.select('rect.date_marker')
                            .attr('x', 0)
                            .attr('y', 47)
                            .attr('class', 'date_marker')
                            .style('shape-rendering', 'crispEdges')
                            .attr('fill', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 0) {
                                    return 'none';
                                } else if (width <= 40) {
                                    if (timeDomainString === 'today') {
                                        return 'none';
                                    }

                                    return '#74AFDD';
                                } else {
                                    return 'none';
                                }
                            })
                            .attr('width', function () {
                                var width =
                                    (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 0) {
                                    width = 0;
                                } else if (width <= 40) {
                                    width = 2;
                                }

                                return width;
                            })
                            .attr('height', function () {
                                var width = (x(moment().endOf('day')) - x(moment().startOf('day')));

                                if (width <= 40) {
                                    return height - margin.top - 47;
                                } else {
                                    return 0;
                                }
                            })
                            .transition()
                            .attr('transform', markerTransform);
                        // today marker ends

                        node = ganttChartGroup.selectAll('.node').data(tasks, keyFunction);
                        campaignBody = ganttChartGroup.selectAll('.campaigns').data(tasks, keyFunction);
                        campaignText = ganttChartGroup.selectAll('.campaigns_name').data(tasks, keyFunction);

                        brandNameText = ganttChartGroup.selectAll('.brand_name').data(tasks, keyFunction);
                        campaignTopStroke = ganttChartGroup.selectAll('.header').data(tasks, keyFunction);
                        campaignsStatusIcon = ganttChartGroup.selectAll('.icon').data(tasks, keyFunction);

                        // markers
                        nodeMarker = ganttChartGroup.selectAll('.node-marker').data(tasks, keyFunction);
                        markers = ganttChartGroup.selectAll('.past-marker').data(tasks, keyFunction);

                        pastMarkerText = ganttChartGroup.selectAll('.past-marker-text').data(tasks, keyFunction);

                        pastMarkerTextDetails =
                            ganttChartGroup.selectAll('.past-marker-text-details').data(tasks, keyFunction);

                        campaignsBottomStroke = ganttChartGroup.selectAll('.campaign_stroke').data(tasks, keyFunction);

                        // Stroke - Bottom for the campaign (1px #ccd2da)
                        campaignsBottomStroke
                            .transition()
                            .delay(0)
                            .attr('y2', function (d) {
                                var padding = calculateBrandAdjustment(d, counterObj.strokeY2);

                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    return y(d.taskName) + CAMPAIGN_HEIGHT - padding;
                                }
                            })
                            .attr('x2', function (d) {
                                var width;

                                if (d.type === 'brand') {
                                    return 0;
                                } else {
                                    width = x(d.endDate) - x(d.startDate);

                                    if (width > 0) {
                                        return width;
                                    } else {
                                        return 0;
                                    }
                                }
                            });

                        translateVisualElements = function (a, type) {
                            if (type === 'node') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('transform', function (d) {
                                        if (d.type === 'brand') {
                                            return 'translate(0,' + y(d.taskName) + ')';
                                        } else {
                                            return 'translate(' + x(d.startDate) + ',' + y(d.taskName) + ')';
                                        }
                                    });
                            } else if (type === 'body') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('width', function (d) {
                                        var width;

                                        if (d.type === 'brand') {
                                            return 0;
                                        } else {
                                            width = (x(d.endDate) - x(d.startDate)) - 4;

                                            if (!isFuture(tdEdges[1], d.endDate) && isPast(tdEdges[0], d.startDate)) {
                                                width = width + 4;
                                            } else if (isFuture(tdEdges[1], d.endDate) &&
                                                !isPast(tdEdges[0], d.startDate)) {
                                                width = width + 2;
                                            }else if (!isFuture(tdEdges[1], d.endDate) &&
                                                !isPast(tdEdges[0], d.startDate)) {
                                                width = width + 4;
                                            }

                                            if (width >= 0) {
                                                return (width);
                                            } else {
                                                return 0;
                                            }
                                        }
                                    })
                                    .attr('x', function (d) {
                                        if (isPast(tdEdges[0], d.startDate)) {
                                            return 2;
                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('y', function (d) {
                                        var padding = calculateBrandAdjustment(d, counterObj.body);

                                        return y(d.taskName) + 2 - padding;
                                    });
                            } else if (type === 'top') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('width', function (d) {
                                        var width;

                                        if (d.type === 'brand') {
                                            return 0;
                                        } else if (d.kpiStatus === 'ontrack' ||
                                            d.kpiStatus === 'underperforming' ||
                                            d.kpiStatus === 'NA' ||
                                            d.kpiStatus === undefined ||
                                            d.kpiStatus === 'Unknown') {
                                            // fix for removing the  rectangle that was sticking on the axis
                                            // even after campaigns were scrolled out of the view
                                            if (x(d.endDate) - x(d.startDate) === 0) {
                                                return 0;
                                            }

                                            if (!isFuture(tdEdges[1], d.endDate) && isPast(tdEdges[0], d.startDate)) {
                                                return (x(d.endDate) - x(d.startDate)) + 2;
                                            }

                                            width = (x(d.endDate) - x(d.startDate));

                                            // prevent passing negative width to the attribute
                                            if (width >= 0) {
                                                return width;
                                            } else {
                                                return 0;
                                            }

                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('x', function (d) {
                                        if (isPast(tdEdges[0], d.startDate)) {
                                            return 0;
                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('y', function (d) {
                                        var padding = calculateBrandAdjustment(d, counterObj.top);

                                        return y(d.taskName) - padding;
                                    });
                            } else if (type === 'past-markers') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('xlink:href', function (d) {
                                        tdEdges = gantt.timeDomain();

                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            // left
                                            if (d.kpiStatus === 'ontrack') {
                                                return window.assets.green_left;
                                            } else if (d.kpiStatus === 'underperforming') {
                                                return window.assets.orange_left;
                                            } else {
                                                return window.assets.gray_left;
                                            }
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            // right
                                            if (d.kpiStatus === 'ontrack') {
                                                return window.assets.green_right;
                                            } else if (d.kpiStatus === 'underperforming') {
                                                return window.assets.orange_right;
                                            } else {
                                                return window.assets.gray_right;
                                            }
                                        }
                                    })
                                    .attr('width', function (d) {
                                        if (d.type === 'brand') {
                                            return 0;
                                        } else if (d.kpiStatus === 'ontrack' ||
                                            d.kpiStatus === 'underperforming' ||
                                            d.kpiStatus === 'NA' ||
                                            d.kpiStatus === undefined ||
                                            d.kpiStatus === 'Unknown') {
                                            if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                                return 25;
                                            } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                                return 25;
                                            } else {
                                                return 0;
                                            }
                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('transform', function (d) {
                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            return  'translate(0,' + y(d.taskName) + ')';
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            return  'translate(480,' + y(d.taskName) + ')';
                                        }

                                        // TODO - check if this is required in corner cases -
                                        // will take it up during calendar refactoring
                                        // else {
                                        //     return  'translate(-100,' + y(d.taskName) + ')';
                                        // }
                                    });
                            } else if (type === 'node-marker') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('transform', function (d) {
                                        var padding = calculateBrandAdjustment(d, counterObj.marker);

                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            return  'translate(0,' + (y(d.taskName) - padding) + ')';
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            return  'translate(630,' + (y(d.taskName) - padding) + ')';
                                        }

                                        // TODO - check if this is required in corner cases -
                                        // will take it up during calendar refactoring
                                        // else {
                                        //     return  'translate(-100,' + y(d.taskName) + ')';
                                        // }
                                    });
                            }
                        };

                        translateGraphicElements = function (a, type) {
                            if (type === 'brand_name') { // jshint ignore:line
                            } else if (type === 'text') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('width', function (d) {
                                        if ((x(d.endDate) - x(d.startDate)) !== 0) {
                                            return 15;
                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('style', function (d) {
                                        if (d.type === 'brand') {
                                            return 'display:none';
                                        } else if ((x(d.endDate) - x(d.startDate)) >= 40) {
                                            return 'cursor:pointer';
                                        } else {
                                            return 'display:none';
                                        }
                                    })
                                    .attr('y', function (d) {
                                        var padding = calculateBrandAdjustment(d, counterObj.text);

                                        return y(d.taskName) + 13 - padding;
                                    })
                                    .text(function (d) {
                                        // width of the container
                                        var fitCount,

                                            width = (x(d.endDate) - x(d.startDate)),

                                        // character count of the camapaign name
                                            stringLength = d.name.length;

                                        if (width > 25) {
                                            // minimum width to fit in the icon
                                            width = Math.abs(25 - width);
                                        }

                                        // considering approx. of 10px for a character
                                        fitCount = width / 7;

                                        if (fitCount >= stringLength) {
                                            // texts fits :)
                                            return d.name;
                                        } else {
                                            return d.name.substr(0, fitCount) + '...';
                                        }
                                    });
                            } else if (type === 'past-marker-text') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('y', function (d) {
                                        return y(d.taskName) + 13;
                                    })
                                    .attr('style', function () {
                                        return 'display:none';
                                    })
                                    .text(function (d) {
                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            return moment(d.startDate).format('DD MMM') +
                                                '-' + moment(d.endDate).format('DD MMM') + ' ';
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            return moment(d.startDate).format('DD MMM') +
                                                '-' + moment(d.endDate).format('DD MMM') + ' ';
                                        }
                                    });
                            } else if (type === 'past-marker-text-details') {
                                a
                                    .transition()
                                    .delay(0)
                                    .attr('y', function (d) {
                                        return y(d.taskName) + 13;
                                    })
                                    .attr('style', function () {
                                        return 'display:none';
                                    })
                                    .text(function (d) {
                                        if (isPastView(tdEdges[0], d.startDate, d.endDate)) {
                                            return d.name;
                                        } else if (isFutureView(tdEdges[1], d.startDate, d.endDate)) {
                                            if (d.name.length > 57) {
                                                return d.name.substr(0, 57) + '...';
                                            } else {
                                                return d.name;
                                            }
                                        }
                                    });
                            } else {
                                a
                                    .transition()
                                    .delay(0).attr('style', function (d) {
                                        if (d.type === 'brand') {
                                            return 'display:none';
                                        } else if ((x(d.endDate) - x(d.startDate)) >= 40) {
                                            return 'cursor:pointer';
                                        } else {
                                            return 'display:none';
                                        }
                                    })
                                    .attr('width', function (d) {
                                        if (d.type === 'brand') {
                                            return 0;
                                        } else if ((x(d.endDate) - x(d.startDate)) !== 0) {
                                            return 13;
                                        } else {
                                            return 0;
                                        }
                                    })
                                    .attr('y', function (d) {
                                        var padding = calculateBrandAdjustment(d, counterObj.icon);

                                        return y(d.taskName) + 6 - padding;
                                    });
                            }
                        };

                        translateVisualElements(node, 'node');
                        translateVisualElements(campaignBody, 'body');
                        translateVisualElements(campaignTopStroke, 'top');

                        translateVisualElements(nodeMarker, 'node-marker');
                        translateVisualElements(markers, 'past-markers');
                        translateGraphicElements(pastMarkerText, 'past-marker-text');
                        translateGraphicElements(pastMarkerTextDetails, 'past-marker-text-details');

                        translateGraphicElements(campaignText, 'text');
                        translateGraphicElements(brandNameText, 'brand_name');
                        translateGraphicElements(campaignsStatusIcon);

                        rectData.exit().remove();

                        svgHeader
                            .select('.x')
                            .transition()
                            .call(xAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-family: Avenir; font-size: 14px')
                            .attr('x', function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return 10;
                                    } else {
                                        return 10;
                                    }
                                } else if (timeDomainString === 'today') {
                                    // checking if first tick date =   tick data
                                    if (moment()
                                            .startOf('day')
                                            .subtract(3, 'days')
                                            .format('MM/DD/YYYY') ===
                                        moment(d).format('MM/DD/YYYY')) {
                                        return 50;
                                    } else {
                                        return 60;
                                    }
                                } else if (timeDomainString === 'year') {
                                    if (moment()
                                            .startOf('year')
                                            .format('MM/DD/YYYY') ===
                                        moment(d).format('MM/DD/YYYY')) {
                                        return 20;
                                    } else {
                                        return 26;
                                    }
                                } else {
                                    if (moment()
                                            .startOf('quarter')
                                            .format('MM/DD/YYYY') ===
                                        moment(d).format('MM/DD/YYYY')) {
                                        return 128;
                                    } else {
                                        return 145;
                                    }
                                }
                            })
                            .attr('y', function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return (height - 10) * -1;
                                    } else {
                                        return (height - 70) * -1;
                                    }
                                } else {
                                    return (height - 50) * -1;
                                }
                            })
                            .call(wrap, 10, timeDomainString, function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return 5;
                                    } else {
                                        return 10;
                                    }
                                } else if (timeDomainString === 'today') {
                                    if (i === 0) {
                                        return 60;
                                    } else {
                                        return 60;
                                    }
                                } else if (timeDomainString === 'year') {
                                    if (i === 0) {
                                        return 26;
                                    } else {
                                        return 26;
                                    }
                                } else {
                                    if (i === 0) {
                                        return 145;
                                    } else {
                                        return 145;
                                    }
                                }
                            }, height);

                        svg
                            .select('.x')
                            .transition()
                            .call(xAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-family: Avenir; font-size: 14px')
                            .attr('x', function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return 10;
                                    } else {
                                        return 10;
                                    }
                                } else if (timeDomainString === 'today') {
                                    if (i === 0) {
                                        return 30;
                                    } else {
                                        return 60;
                                    }
                                } else if (timeDomainString === 'year') {
                                    if (i === 0) {
                                        return 16;
                                    } else {
                                        return 26;
                                    }
                                } else {
                                    if (i === 0) {
                                        return 128;
                                    } else {
                                        return 145;
                                    }
                                }
                            })
                            .attr('y', function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return (height - 10) * -1;
                                    } else {
                                        return (height - 70) * -1;
                                    }
                                } else {
                                    return (height - 50) * -1;
                                }
                            })
                            .call(wrap, 10, timeDomainString, function (d, i) {
                                // formatting for ticks
                                if (timeDomainString === 'month') {
                                    if (i === 0) {
                                        return 5;
                                    } else {
                                        return 10;
                                    }
                                } else if (timeDomainString === 'today') {
                                    if (i === 0) {
                                        return 60;
                                    } else {
                                        return 60;
                                    }
                                } else if (timeDomainString === 'year') {
                                    if (i === 0) {
                                        return 26;
                                    } else {
                                        return 26;
                                    }
                                } else {
                                    if (i === 0) {
                                        return 145;
                                    } else {
                                        return 145;
                                    }
                                }
                            }, height);

                        svg
                            .select('.y')
                            .transition()
                            .call(yAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-weight: bold; font-family: Avenir; font-size: 13pt');

                        svgHeader
                            .select('.y')
                            .transition()
                            .call(yAxis)
                            .selectAll('.tick text')
                            .attr('style', 'font-weight: bold; font-family: Avenir; font-size: 13pt');

                        return gantt;
                    };
                    // END OF DRAW

                    gantt.redraw = function (tasks, timeDomainString) {
                        initTimeDomain(tasks);
                        initAxis(timeDomainString);
                        gantt.draw(tasks, timeDomainString);

                        return gantt;
                    };

                    gantt.margin = function (value) {
                        if (!arguments.length) {
                            return margin;
                        }

                        margin = value;

                        return gantt;
                    };

                    gantt.timeDomain = function (value) {
                        if (!arguments.length) {
                            return [timeDomainStart, timeDomainEnd];
                        }

                        timeDomainStart = +value[0];
                        timeDomainEnd = +value[1];

                        return gantt;
                    };

                    /**
                     * @param value The value can be 'fit' - the domain fits the data or 'fixed' - fixed domain.
                     */
                    gantt.timeDomainMode = function (value) {
                        if (!arguments.length) {
                            return timeDomainMode;
                        }

                        timeDomainMode = value;

                        return gantt;
                    };

                    gantt.taskTypes = function (value) {
                        if (!arguments.length) {
                            return taskTypes;
                        }

                        taskTypes = value;

                        return gantt;
                    };

                    gantt.taskStatus = function (value) {
                        if (!arguments.length) {
                            return taskStatus;
                        }

                        taskStatus = value;

                        return gantt;
                    };

                    gantt.width = function (value) {
                        if (!arguments.length) {
                            return width;
                        }

                        width = +value;

                        return gantt;
                    };

                    gantt.height = function (value) {
                        if (!arguments.length) {
                            return height;
                        }

                        height = +value;

                        return gantt;
                    };

                    gantt.tickFormat = function (value) {
                        if (!arguments.length) {
                            return tickFormat;
                        }

                        tickFormat = value;

                        return gantt;
                    };

                    gantt.isSingleBrand = function (singleBrand) {
                        if (singleBrand === true) {
                            isSingleBrand = true;
                        } else {
                            isSingleBrand = false;
                        }
                        return gantt;
                    };

                    return gantt;
                };
                // end of gantt

                // expose this function to public
                this.newCalendar = newCalendar;
                this.updateCalendar = updateCalendar;
                this.addTask = addTask;
                this.prev = prev;
                this.next = next;
                this.month = month;
                this.today = today;
                this.year = year;
                this.quarter = quarter;
                this.loadMoreItemToCalender = loadMoreItemToCalender;
            }
        ]);
    }
);
