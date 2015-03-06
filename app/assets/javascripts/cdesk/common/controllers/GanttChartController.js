(function() {
    'use strict';
    commonModule.controller('ganttChartController', function($scope, $location, ganttChart, ganttChartModel, constants, brandsModel, loginModel, analytics) {


        $scope.init = function(update) {
            $scope.calendarBusy = true;
            $scope.selected = "quarter";
            ganttChartModel.getGanttChartData().then(function(result) {
                $scope.calendarBusy = false;
                $scope.noData = false;
                var brands = [],
                    campaigns = [],
                    count = 0,
                    limit = 5;
                //TODO: move this into a service
                if (result != undefined && result.brands != undefined && result.brands.length > 0) {
                    $scope.noData = false;
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
                            //push a brand into campaign list as type=brand and min and max date
                            c.taskName = count;
                            // var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                            // var data= _.first(temp); //getting lowest start date
                            // c.startDate = new Date(data.start_date);
                            c.startDate = moment().subtract(2, 'years').startOf('year');
                            // temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                            // data= _.last(temp); //getting highest start date
                            // c.endDate = new Date(data.end_date);
                            c.endDate = moment().add(2, 'years').endOf('year');

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
                        //push a brand into campaign list as type=brand and min and max date
                        c.taskName = count;
                        // var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                        // var data= _.first(temp); //getting lowest start date
                        // c.startDate = new Date(data.start_date);
                        c.startDate = moment().subtract(2, 'years').startOf('year');
                        // temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                        // data= _.last(temp); //getting highest start date
                        // c.endDate = new Date(data.end_date);
                        c.endDate = moment().add(2, 'years').endOf('year');

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
                        // ganttChart.updateCalendar(campaigns, brands);
                    }

                } else {
                    //   console.log('no calendar data');
                    $scope.noData = true;
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
                $scope.init();
            } else {
                //single brand
                $scope.init('single_brand');
            }

        });


    });
}());