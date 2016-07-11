define(['angularAMD', 'reporting/common/d3/gantt_chart', // jshint ignore:line
    'reporting/models/gantt_chart_model', 'common/services/constants_service', 'reporting/brands/brands_model',
    'login/login_model', 'common/moment_utils' ], function (angularAMD) {
    'use strict';

    angularAMD.controller('GanttChartController', function ($scope, ganttChart, ganttChartModel, constants, brandsModel,
                                                           loginModel, momentService) {
        var _curCtrl = this;

        _curCtrl.filter = undefined;
        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;
        $scope.message = constants.MSG_DATA_NOT_AVAILABLE;

        $scope.calendar = function (filter) {
            $scope.selected = 'quarter';

            if (brandsModel.getSelectedBrand().id === -1) {
                _curCtrl.filter = filter;
                $scope.init(null, filter);
            } else {
                $scope.init('single_brand', filter);
            }
        };

        $scope.selectedFilter = function () {
            return ganttChartModel.filter === 'budget' ? 'Budget' : 'End Dates';
        };

        $scope.init = function (update, filter) {
            $scope.brandNotSelected = true;
            $('.chart').remove();
            $('.header-chart').remove();
            $scope.calendarBusy = true;
            $scope.selected = 'quarter';
            ganttChartModel.pageCount = 1;
            _curCtrl.calendarLastPage = false;

            if (filter === undefined) {
                ganttChartModel.filter = 'end_date';
            } else {
                ganttChartModel.filter = filter;
            }

            ganttChartModel
                .getGanttChartData()
                .then(function (result) {
                    var brands = [],
                        campaigns = [],
                        count = 0,
                        startDate,
                        endDate,
                        loop = 0;

                    $scope.calendarBusy = false;

                    //TODO: move this into a service
                    if (result !== undefined && result.brands !== undefined && result.brands.length > 0) {
                        $scope.calendarData = result.brands.length;
                        $scope.dataFound = true;

                        //getting endpoint dates for calendar.
                        _.each(result.brands, function (datum) { // jshint ignore:line
                            _.each(datum.campaigns, function (tasks) { // jshint ignore:line
                                var campaignEndDate = momentService.utcToLocalTime(tasks.end_date,
                                        constants.DATE_UTC_SHORT_FORMAT),
                                    campaignStartDate = momentService.utcToLocalTime(tasks.start_date,
                                        constants.DATE_UTC_SHORT_FORMAT);

                                if (loop === 0) {
                                    startDate = moment(campaignEndDate).startOf('day'); // jshint ignore:line
                                    endDate = moment(campaignStartDate).endOf('day'); // jshint ignore:line
                                }

                                loop++;

                                if (moment(startDate).toDate() >  // jshint ignore:line
                                    moment(campaignStartDate).toDate()) { // jshint ignore:line
                                    startDate = moment(campaignStartDate).startOf('month'); // jshint ignore:line
                                }

                                if (moment(endDate).toDate() < // jshint ignore:line
                                    moment(campaignEndDate).toDate()) { // jshint ignore:line
                                    endDate = moment(campaignEndDate).endOf('month'); // jshint ignore:line
                                }
                            });
                        });

                        _.each(result.brands, function (datum) { // jshint ignore:line
                            var space,
                                tab = 0,
                                c = {};

                            if (count === 0) {
                                //space before first brand
                                tab = 2;
                            } else {
                                //space before each brand
                                tab = 1;
                            }

                            for (space = 0; space <= tab; space++) {
                                //placeholder - empty value to add spacing
                                count++;
                                c.id = count;
                                c.name = ' ';
                                c.type = 'brand';
                                c.status = '';
                                c.taskName = count;
                                c.startDate = startDate;
                                c.endDate = endDate;
                                campaigns.push(c);
                                brands.push(count);
                            }

                            //brand injected
                            count++;
                            c = {};
                            c.id = datum.id;
                            c.name = datum.name;
                            c.type = 'brand';
                            c.status = '';
                            c.taskName = count;
                            c.startDate = startDate;
                            c.endDate = endDate;
                            campaigns.push(c);
                            brands.push(count);

                            _.each(datum.campaigns, function (tasks) { // jshint ignore:line
                                var c = {};

                                count++;
                                c.id = tasks.id;
                                c.name = tasks.name;

                                c.startDate =
                                    moment(momentService.utcToLocalTime(tasks.start_date, // jshint ignore:line
                                    constants.DATE_UTC_SHORT_FORMAT)).startOf('day');

                                c.endDate = moment(momentService.utcToLocalTime(tasks.end_date, // jshint ignore:line
                                    constants.DATE_UTC_SHORT_FORMAT)).endOf('day');

                                c.state = tasks.state;
                                c.kpiStatus = tasks.kpi_status;
                                c.taskName = count;
                                brands.push(count);
                                campaigns.push(c);
                            });
                        });

                        if (brandsModel.getSelectedBrand().id === -1) {
                            ganttChart.newCalendar(campaigns, brands);
                        } else if (update || brandsModel.getSelectedBrand().id) {
                            ganttChart.newCalendar(campaigns, brands, true);
                            $scope.brandNotSelected = false;
                        }
                    } else {
                        $scope.calendarBusy = false;
                        $scope.dataFound = false;
                    }

                    _curCtrl.count = count;
                });
        };

        $scope.loadMoreItems = function (filter) {
            $scope.loadingMore = true;
            $scope.brandNotSelected = false;

            if (filter === undefined) {
                ganttChartModel.filter = 'end_date';
            } else {
                ganttChartModel.filter = filter;
            }

            ganttChartModel
                .getGanttChartData()
                .then(function (result) {
                    var brands = [],
                        campaigns = [],
                        count = _curCtrl.count,
                        o = {},
                        loop = 0;

                    $scope.loadingMore = false;
                    o.selected = $scope.selected;

                    //TODO: move this into a service
                    if (result !== undefined && result.brands !== undefined && result.brands.length > 0) {
                            $scope.calendarData = result.brands.length;
                            $scope.dataFound = true;

                            //getting endpoint dates for calendar.
                            _.each(result.brands, function (datum) { // jshint ignore:line
                                _.each(datum.campaigns, function (tasks) { // jshint ignore:line
                                    var campaignEndDate = momentService.utcToLocalTime(tasks.end_date,
                                            constants.DATE_UTC_SHORT_FORMAT),
                                        campaignStartDate = momentService.utcToLocalTime(tasks.start_date,
                                            constants.DATE_UTC_SHORT_FORMAT);

                                    if (loop === 0) {
                                        o.startDate = moment(campaignEndDate).startOf('day'); // jshint ignore:line
                                        o.endDate = moment(campaignStartDate).endOf('day'); // jshint ignore:line
                                    }

                                    loop++;

                                    if (moment(o.startDate).toDate() > // jshint ignore:line
                                        moment(campaignStartDate).toDate()) { // jshint ignore:line
                                        o.startDate = moment(campaignStartDate).startOf('month'); // jshint ignore:line
                                    }

                                    if (moment(o.endDate).toDate() < // jshint ignore:line
                                        moment(campaignEndDate).toDate()) { // jshint ignore:line
                                        o.endDate = moment(campaignEndDate).endOf('month'); // jshint ignore:line
                                    }

                                });
                            });

                            _.each(result.brands, function (datum) { // jshint ignore:line
                                _.each(datum.campaigns, function (tasks) { // jshint ignore:line
                                    var c = {};

                                    count++;
                                    c.id = tasks.id;
                                    c.name = tasks.name;

                                    c.startDate =
                                        moment(momentService.utcToLocalTime(tasks.start_date, // jshint ignore:line
                                        constants.DATE_UTC_SHORT_FORMAT)).startOf('day');

                                    c.endDate =
                                        moment(momentService.utcToLocalTime(tasks.end_date, // jshint ignore:line
                                        constants.DATE_UTC_SHORT_FORMAT)).endOf('day');

                                    c.state = tasks.state;
                                    c.kpiStatus = tasks.kpi_status;
                                    c.taskName = count;
                                    brands.push(count);
                                    campaigns.push(c);
                                });
                            });

                            ganttChart.loadMoreItemToCalender(campaigns, brands, o);
                    } else {
                        _curCtrl.calendarLastPage = true;
                    }
                });
        };

        $scope.add = function () {
            ganttChart.addTask();
        };

        $scope.prev = function () {
            ganttChart.prev($scope.selected);
        };

        $scope.next = function () {
            ganttChart.next($scope.selected);
        };

        $scope.month = function () {
            $scope.selected = 'month';
            ganttChart.month();
        };

        $scope.today = function () {
            $scope.selected = 'today';
            ganttChart.today();
        };

        $scope.quarter = function () {
            $scope.selected = 'quarter';
            ganttChart.quarter();
        };

        $scope.year = function () {
            $scope.selected = 'year';
            ganttChart.year();
        };

        //removing chart to update and redraw
        $scope.refresh = function () {
            $scope.calendar(ganttChartModel.filter);
        };

        $scope.refresh();

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function (event, args) {
            if (args.event_type === 'clicked') {
                $scope.refresh();
            }
        });

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            if (args.event_type === 'clicked') {
                $scope.refresh();
            }
        });

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

        $scope.calendarWidgetInit = function () {
            $('#calendar_widget').scroll(function () {
                if (brandsModel.getSelectedBrand().id !== -1 &&
                    !$scope.loadingMore && !$scope.calendarBusy &&
                    !_curCtrl.calendarLastPage &&
                    ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight)) {
                    ganttChartModel.pageCount++;
                    $scope.loadMoreItems();
                }
            });
        };
    });
});
