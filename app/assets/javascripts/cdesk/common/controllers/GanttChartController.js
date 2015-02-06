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
                        c.id = tasks.id;
                        c.name = tasks.name;
                        c.startDate = new Date(tasks.start_date);
                        c.endDate = new Date(tasks.end_date);
                        c.status = tasks.status;
                        c.taskName =  datum.name;
                        campaigns.push(c);
                    });

                });
                ganttChart.newCalendar(campaigns, brands);
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

        $scope.init();

    });
}());