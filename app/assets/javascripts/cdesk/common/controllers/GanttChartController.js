(function () {
    'use strict';
    commonModule.controller('ganttChartController', function ($scope, $location, ganttChart, ganttChartModel, constants) {

    	
    	$scope.init = function(update){
            $scope.calendarBusy = true;
            ganttChartModel.getGanttChartData().then(function(result) {
                $scope.calendarBusy = false;
                var brands = [],
                    campaigns = [],
                    count =0;
                //TODO: move this into a service
                if(result.brands.length >0){
                    _.each(result.brands, function(datum) {

                        //placeholder - empty value to add spacing
                        count++;
                        var c = {};
                            c.id = count;
                            c.name = " ";
                            c.type = "brand";
                            c.status = "";
                            //push a brand into campaign list as type=brand and min and max date
                            c.taskName =  count;
                                var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                                var data= _.first(temp); //getting lowest start date
                                c.startDate = new Date(data.start_date);
                                temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                                data= _.last(temp); //getting highest start date
                                c.endDate = new Date(data.end_date);
                            campaigns.push(c);
                            brands.push(count);

                        //brand injected
                        count++;
                            c = {};
                            c.id = datum.id;
                            c.name = datum.name;
                            c.type = "brand";
                            c.status = "";
                            //push a brand into campaign list as type=brand and min and max date
                            c.taskName =  count;
                                var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                                var data= _.first(temp); //getting lowest start date
                                c.startDate = new Date(data.start_date);
                                temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                                data= _.last(temp); //getting highest start date
                                c.endDate = new Date(data.end_date);
                            campaigns.push(c);
                            brands.push(count);

                            _.each(datum.campaigns, function(tasks) {
                                count++;
                                var c = {};
                                c.id = tasks.id;
                                c.name = tasks.name;
                                c.startDate = new Date(tasks.start_date);
                                c.endDate = new Date(tasks.end_date);
                                c.state = tasks.state;
                                c.kpiStatus = tasks.kpi_status;
                                c.taskName =  count;
                                brands.push(count);
                                campaigns.push(c);
                            });
                        
                    });

                    if(update === undefined){
                        ganttChart.newCalendar(campaigns, brands);
                    } else {
                        //TODO stabilize update
                        //ganttChart.updateCalendar(campaigns, brands);
                    }
            } else {
                console.log('no calendar data');
            }

            
            });
        };

        //Listener for brand changes
        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            $scope.init('update');
        });

        $scope.add = function(){
        	ganttChart.addTask();
        }
         $scope.prev = function(){
        	ganttChart.prev();
        }

        $scope.next = function(){
        	ganttChart.next();
        }

        $scope.month = function(){
            ganttChart.month();
        }

        $scope.today = function(){
            ganttChart.today();
        }

        $scope.quarter = function(){
            ganttChart.quarter();
        }

        $scope.year = function(){
            ganttChart.year();
        }

        $scope.init();

    });
}());