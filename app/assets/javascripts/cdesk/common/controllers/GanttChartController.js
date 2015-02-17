(function () {
    'use strict';
    commonModule.controller('ganttChartController', function ($scope, $location, ganttChart, ganttChartModel, constants) {

    	
    	$scope.init = function(update){
            $scope.calendarBusy = true;
            ganttChartModel.getGanttChartData().then(function(result) {
                $scope.calendarBusy = false;
                $scope.noData = false;
                var brands = [],
                    campaigns = [],
                    count =0,
                    limit = 5;
                //TODO: move this into a service
                if(result != undefined && result.brands != undefined &&  result.brands.length >0){
                    $scope.noData = false;
                    _.each(_.first(result.brands,5), function(datum) {

                        //placeholder - empty value to add spacing
                        count++;
                        var c = {};
                            c.id = count;
                            c.name = " ";
                            c.type = "brand";
                            c.status = "";
                            //push a brand into campaign list as type=brand and min and max date
                            c.taskName =  count;
                                // var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                                // var data= _.first(temp); //getting lowest start date
                                // c.startDate = new Date(data.start_date);
                                c.startDate=moment().subtract(2, 'years').startOf('year');
                                // temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                                // data= _.last(temp); //getting highest start date
                                // c.endDate = new Date(data.end_date);
                                c.endDate = moment().add(2, 'years').endOf('year');

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
                                // var temp = _.sortBy(datum.campaigns, function(o) { return o.start_date; })
                                // var data= _.first(temp); //getting lowest start date
                                // c.startDate = new Date(data.start_date);
                                c.startDate=moment().subtract(2, 'years').startOf('year');
                                // temp = _.sortBy(datum.campaigns, function(o) { return o.end_date; })
                                // data= _.last(temp); //getting highest start date
                                // c.endDate = new Date(data.end_date);
                                c.endDate = moment().add(2, 'years').endOf('year');

                            campaigns.push(c);
                            brands.push(count);

                            _.each(_.first(datum.campaigns, limit), function(tasks) {
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
                        // console.log(brands);
                        // console.log(campaigns);

                        ganttChart.newCalendar(campaigns, brands);
                       // ganttChart.updateCalendar(campaigns, brands);
                    }
            } else {
             //   console.log('no calendar data');
                $scope.noData = true;
            }

            
            });
        };

       
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

         //Listener for brand changes
        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
            //removing chart to update and redraw
            $('.chart').remove()
            $scope.init('update');
        });


    });
}());