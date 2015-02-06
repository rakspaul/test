(function () {
    'use strict';
    commonModule.controller('ganttChartController', function ($scope, $location, ganttChart, ganttChartModel) {

    	
    	$scope.init = function(){
            $scope.calendarBusy = true;
            ganttChartModel.getGanttChartData().then(function(result) {
                $scope.calendarBusy = false;
                var brands = [],
                    campaigns = [];
                //TODO: move this into a service
                _.each(result.brands, function(datum) {
                    brands.push(datum.name);

                    _.each(datum.campaigns, function(tasks) {
                       // tasks.taskName = datum.name;
                        var c = {};
                        c.name = tasks.name;
                        c.startDate = new Date(tasks.start_date);
                        c.endDate = new Date(tasks.end_date);
                        c.status = "FAILED";
                        c.taskName =  datum.name;
                        campaigns.push(c);
                    });

                });
                console.log(campaigns);
                ganttChart.newCalendar(campaigns, brands);
            });



           

        };
        $scope.add = function(){
        	console.log('adding');
        	  	ganttChart.addTask();
        }
         $scope.prev = function(){
        	console.log('adding');
        	  	ganttChart.prev();
        }

        $scope.next = function(){
        	console.log('adding');
        	  	ganttChart.next();
        }

        $scope.month = function(){
            console.log('adding');
                ganttChart.month();
        }

         $scope.today = function(){
            console.log('adding');
                ganttChart.today();
        }
        $scope.init();

    });
}());