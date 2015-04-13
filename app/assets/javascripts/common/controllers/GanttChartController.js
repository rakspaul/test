(function() {
    'use strict';
    commonModule.controller('ganttChartController', function($scope, $location, ganttChart, ganttChartModel, constants, brandsModel, loginModel, analytics) {

        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;
        $scope.message = constants.MSG_DATA_NOT_AVAILABLE;
        $scope.calendar = function(filter) {

            $('.chart').remove();
            $scope.selected = "quarter";
            if (brandsModel.getSelectedBrand().id == -1) {
                $scope.init(null, filter);
            } else {
                //single brand
                $scope.init('single_brand', filter);
            }

        };

        $scope.selectedFilter = function() {
            var text;
            switch(ganttChartModel.filter) {
                case 'budget': 
                        text = "Budget";
                        break;
                case 'end_date': 
                default: 
                        text = "End Dates";
            }
            return text;
        };
        
        $scope.init = function(update, filter) {
            $scope.brandNotSelected = true;
            $scope.calendarBusy = true;
            $scope.selected = "quarter";
            if(filter === undefined) {
                ganttChartModel.filter = 'end_date';
            } else {
                ganttChartModel.filter = filter;
            }
            ganttChartModel.getGanttChartData().then(function(result) {
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
                    var startDate, endDate, loop=0 ;
                    _.each(result.brands, function(datum) {
                        _.each(datum.campaigns, function(tasks) {
                            if(loop == 0) {
                                startDate = moment(tasks.start_date).startOf('day');
                                endDate = moment(tasks.end_date).endOf('day');
                            }
                            loop++;

                            if(moment(startDate).toDate() > moment(tasks.start_date).toDate()) {
                                startDate = moment(tasks.start_date).startOf('year');
                            }

                            if (moment(endDate).toDate() < moment(tasks.end_date).toDate()) {
                                endDate  = moment(tasks.end_date).endOf('year');
                            }

                        });
                    });
                    

                    _.each(result.brands, function(datum) {
                        var space = 0;
                        for (space = 0; space <= 1; space++) {
                            //placeholder - empty value to add spacing
                            count++;
                            var c = {};
                            c.id = count;
                            c.name = " ";
                            c.type = "brand";
                            c.status = "";
                            c.taskName = count;
                            c.startDate =  startDate;
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
                        c.startDate =  startDate;
                        c.endDate = endDate;
                        // c.startDate = moment().subtract(2, 'years').startOf('year');
                        // c.endDate = moment().add(2, 'years').endOf('year');

                        campaigns.push(c);
                        brands.push(count);

                        _.each(datum.campaigns, function(tasks) {
                            count++;
                            var c = {};
                            c.id = tasks.id;
                            c.name = tasks.name;
                            c.startDate = moment(tasks.start_date).startOf('day');
                            c.endDate = moment(tasks.end_date).endOf('day');
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


        $scope.add = function() {
            ganttChart.addTask();
        }
        $scope.prev = function() {
            ganttChart.prev($scope.selected);
        }

        $scope.next = function() {
            ganttChart.next($scope.selected);
        }

        $scope.month = function() {
            $scope.selected = "month";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_month_selected', loginModel.getLoginName());
            ganttChart.month();
        }

        $scope.today = function() {
            $scope.selected = "today";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_week_selected', loginModel.getLoginName());
            ganttChart.today();
        }

        $scope.quarter = function() {
            $scope.selected = "quarter";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_quarter_selected', loginModel.getLoginName());
            ganttChart.quarter();
        }

        $scope.year = function() {
            $scope.selected = "year";
            analytics.track(loginModel.getUserRole(), 'dashboard_calendar_widget', 'date_type_year_selected', loginModel.getLoginName());
            ganttChart.year();
        }

        $scope.init();

        //Listener for brand changes
        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            //removing chart to update and redraw
            $('.chart').remove();
            $scope.selected = "quarter";
            if (brandsModel.getSelectedBrand().id == -1) {
                $scope.init(null, ganttChartModel.filter);
            } else {
                //single brand
                $scope.init('single_brand', ganttChartModel.filter);
            }

        });

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };


    });
}());
