(function () {
    'use strict';
    commonModule.controller('GanttChartController', function ($scope, ganttChart, ganttChartModel, constants, brandsModel, loginModel, analytics,momentService) {

        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;
        $scope.message = constants.MSG_DATA_NOT_AVAILABLE;
        $scope.calendar = function (filter) {

            $scope.selected = "quarter";
            if (brandsModel.getSelectedBrand().id == -1) {
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
            $scope.selected = "quarter";
            if (filter === undefined) {
                ganttChartModel.filter = 'end_date';
            } else {
                ganttChartModel.filter = filter;
            }
            ganttChartModel.getGanttChartData().then(function (result) {
                $scope.calendarBusy = false;
                var brands = [],
                    campaigns = [],
                    count = 0,
                    limit = 5;
                //TODO: move this into a service
                if (result != undefined && result.brands != undefined && result.brands.length > 0) {
                    $scope.calendarData = result.brands.length;
                    $scope.dataFound = true;

                    //getting endpoint dates for calendar. 
                    var startDate, endDate, loop = 0;
                    _.each(result.brands, function (datum) {
                        _.each(datum.campaigns, function (tasks) {
                            var campaignEndDate = momentService.utcToLocalTime(tasks.end_date, constants.DATE_UTC_SHORT_FORMAT);
                            var campaignStartDate = momentService.utcToLocalTime(tasks.start_date, constants.DATE_UTC_SHORT_FORMAT);
                            if (loop == 0) {
                                startDate = moment(campaignEndDate).startOf('day');
                                endDate = moment(campaignStartDate).endOf('day');
                            }
                            loop++;

                            if (moment(startDate).toDate() > moment(campaignStartDate).toDate()) {
                                startDate = moment(campaignStartDate).startOf('month');
                            }

                            if (moment(endDate).toDate() < moment(campaignEndDate).toDate()) {
                                endDate = moment(campaignEndDate).endOf('month');
                            }

                        });
                    });


                    _.each(result.brands, function (datum) {
                        var space = 0,
                            tab = 0;

                        if (count == 0) {
                            tab = 2 //space before first brand
                        } else {
                            tab = 1; //space before each brand
                        }
                        for (space = 0; space <= tab; space++) {
                            //placeholder - empty value to add spacing
                            count++;
                            var c = {};
                            c.id = count;
                            c.name = " ";
                            c.type = "brand";
                            c.status = "";
                            c.taskName = count;
                            c.startDate = startDate;
                            c.endDate = endDate;
                            // c.startDate = moment().subtract(2, 'years').startOf('year');
                            // c.endDate = moment().add(2, 'years').endOf('year');

                            campaigns.push(c);
                            brands.push(count);
                        }

                        //brand injected
                        count++;
                        c = {};
                        c.id = datum.id;
                        c.name = datum.name;
                        c.type = "brand";
                        c.status = "";
                        c.taskName = count;
                        c.startDate = startDate;
                        c.endDate = endDate;
                        // c.startDate = moment().subtract(2, 'years').startOf('year');
                        // c.endDate = moment().add(2, 'years').endOf('year');

                        campaigns.push(c);
                        brands.push(count);

                        _.each(datum.campaigns, function (tasks) {
                            count++;
                            var c = {};
                            c.id = tasks.id;
                            c.name = tasks.name;
                            c.startDate = moment(momentService.utcToLocalTime(tasks.start_date, constants.DATE_UTC_SHORT_FORMAT)).startOf('day');
                            c.endDate = moment(momentService.utcToLocalTime(tasks.end_date, constants.DATE_UTC_SHORT_FORMAT)).endOf('day');
                            c.state = tasks.state;
                            c.kpiStatus = tasks.kpi_status;
                            c.taskName = count;
                            brands.push(count);
                            campaigns.push(c);
                        });
                    });

                    if (brandsModel.getSelectedBrand().id == -1) {
                        ganttChart.newCalendar(campaigns, brands);
                    } else if (update || brandsModel.getSelectedBrand().id) {
                        ganttChart.newCalendar(campaigns, brands, true);
                        $scope.brandNotSelected = false;
                    }

                } else {
                    $scope.calendarBusy = false;
                    $scope.dataFound = false;
                }
            });
        };


        $scope.add = function () {
            ganttChart.addTask();
        }
        $scope.prev = function () {
            ganttChart.prev($scope.selected);
        }

        $scope.next = function () {
            ganttChart.next($scope.selected);
        }

        $scope.month = function () {
            $scope.selected = "month";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_month_selected', loginModel.getLoginName());
            ganttChart.month();
        }

        $scope.today = function () {
            $scope.selected = "today";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_week_selected', loginModel.getLoginName());
            ganttChart.today();
        }

        $scope.quarter = function () {
            $scope.selected = "quarter";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_quarter_selected', loginModel.getLoginName());
            ganttChart.quarter();
        }

        $scope.year = function () {
            $scope.selected = "year";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_year_selected', loginModel.getLoginName());
            ganttChart.year();
        }

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
    });
}());
